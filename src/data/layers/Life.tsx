/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion, createPolynomialScaling } from "features/conversion";
import { jsx, Visibility } from "features/feature";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, Resource, trackBest } from "features/resources/resource";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createBuyable, Buyable, BuyableDisplay } from "features/buyable";
import { computed } from "vue";
import { format } from "util/break_eternity";
import { Computable } from "util/computed";
import advancements from "./Advancements";
import flame from "./Flame";
import lightning from "./Lightning";
import cryo from "./Cryo";
import { globalBus } from "game/events";

const layer = createLayer(() => {
    const id = "l";
    const name = "Life";
    const color = "#32a85e";

    const life = createResource<DecimalSource>(0, "Life Particles");
    const best = trackBest(life);

    const time = createResource<number>(0);

    const gainMult = computed(() => {
        let mult = Decimal.dOne;

        if (lightning.lightningSel.value == 2)
            mult = mult.times(lightning.clickableEffects[2].value);
        if (advancements.milestones[4].earned.value && time.value <= 120) mult = mult.times(3);
        mult = mult.times(buyableEffects[3].value);

        return mult;
    });

    const baseReq = computed(() => {
        let base = 10;

        if (cryo.challenges[1].active.value) base = 1 / 0;

        return base;
    });

    const conversion = createCumulativeConversion(() => ({
        scaling: createPolynomialScaling(baseReq, 1 / 3),
        baseResource: main.particles,
        gainResource: life,
        roundUpCost: true,
        gainModifier: {
            apply: gain => Decimal.mul(gain, gainMult.value),
            revert: gain => Decimal.div(gain, gainMult.value)
        }
    }));

    globalBus.on("update", diff => {
        if (advancements.milestones[3].earned.value)
            life.value = Decimal.mul(conversion.currentGain.value, diff).plus(life.value);
        time.value += diff;
    });

    const extraBuyableLevels = [
        computed(() => {
            let lvl = Decimal.dZero;

            if (flame.upgradesR2[0].bought.value) lvl = lvl.plus(flame.upgradeEffects[3].value);

            return lvl;
        }),
        computed(() => 0),
        computed(() => 0),
        computed(() => 0),
        computed(() => 0)
    ];

    const buyableEffects = {
        0: computed(() => Decimal.add(buyables[0].amount.value, extraBuyableLevels[0].value)),
        1: computed(() =>
            Decimal.pow(2, Decimal.add(buyables[1].amount.value, extraBuyableLevels[1].value))
        ),
        2: computed(() =>
            Decimal.mul(2, Decimal.add(buyables[2].amount.value, extraBuyableLevels[2].value))
        ),
        3: computed(() =>
            Decimal.pow(1.15, Decimal.add(buyables[3].amount.value, extraBuyableLevels[3].value))
        ),
        4: computed(() =>
            Decimal.pow(2.25, Decimal.add(buyables[4].amount.value, extraBuyableLevels[4].value))
        )
    };

    const buyableCostDiv = computed(() => {
        let div = Decimal.dOne;

        div = div.times(cryo.challenge2Data.reward.value);

        return div;
    });

    const buyableCostExp = computed(() => {
        let exp = Decimal.dOne;

        if (cryo.challenges[0].active.value)
            exp = exp.times(cryo.challenge1Data.lifeBuyableCosts.value);
        if (cryo.challenges[2].active.value) exp = exp.times(cryo.challenge3Data.exp.value);

        return exp;
    });

    const buyables: Array<
        Buyable<{
            visibility: () => Visibility.Visible | Visibility.None;
            cost(): Decimal;
            resource: Resource<DecimalSource>;
            display: Computable<BuyableDisplay>;
        }>
    > = [
        createBuyable(() => ({
            visibility: () => (Decimal.gt(best.value, 0) ? Visibility.Visible : Visibility.None),
            cost() {
                const amt = buyables[0].amount.value;
                return Decimal.pow(3, amt).div(buyableCostDiv.value).pow(buyableCostExp.value);
            },
            resource: life,
            display: () => ({
                title: "Regeneration",
                description: "Generate 1 Particle/second.",
                effectDisplay: "+" + format(buyableEffects[0].value)
            })
        })),
        createBuyable(() => ({
            visibility: () =>
                Decimal.gt(buyables[0].amount.value, 0) ? Visibility.Visible : Visibility.None,
            cost() {
                const amt = buyables[1].amount.value;
                return Decimal.pow(4, Decimal.pow(amt, 1.2))
                    .times(10)
                    .div(buyableCostDiv.value)
                    .pow(buyableCostExp.value);
            },
            resource: life,
            display: () => ({
                title: "The Source",
                description: "Double Particle gain.",
                effectDisplay: format(buyableEffects[1].value) + "x"
            })
        })),
        createBuyable(() => ({
            visibility: () =>
                Decimal.gt(buyables[1].amount.value, 0) ? Visibility.Visible : Visibility.None,
            cost() {
                const amt = buyables[2].amount.value;
                return Decimal.pow(2.5, Decimal.pow(amt, 1.4))
                    .times(50)
                    .div(buyableCostDiv.value)
                    .pow(buyableCostExp.value);
            },
            resource: life,
            display: () => ({
                title: "Solar Warmth",
                description: "Flame Upgrade 1's effect increases by 2.",
                effectDisplay: "+" + format(buyableEffects[2].value)
            })
        })),
        createBuyable(() => ({
            visibility: () =>
                advancements.milestones[5].earned.value ? Visibility.Visible : Visibility.None,
            cost() {
                const amt = buyables[3].amount.value;
                return Decimal.pow(2, Decimal.pow(amt, 1.6))
                    .times(200)
                    .div(buyableCostDiv.value)
                    .pow(buyableCostExp.value);
            },
            resource: life,
            display: () => ({
                title: "Existence Formula",
                description: "Increase Life Particle gain by 15%.",
                effectDisplay: format(buyableEffects[3].value, 2) + "x"
            })
        })),
        createBuyable(() => ({
            visibility: () =>
                Decimal.gt(buyables[3].amount.value, 0) ? Visibility.Visible : Visibility.None,
            cost() {
                const amt = buyables[4].amount.value;
                return Decimal.pow(1.5, Decimal.pow(amt, 1.8))
                    .times(1e4)
                    .div(buyableCostDiv.value)
                    .pow(buyableCostExp.value);
            },
            resource: life,
            display: () => ({
                title: "Water Lily",
                description: "Make the Bubble bar 125% faster.",
                effectDisplay: format(buyableEffects[4].value, 2) + "x"
            })
        }))
    ];

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        display: jsx(() => <img src="/nodes/life.png" />),
        color,
        reset
    }));

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));

    return {
        id,
        name,
        color,
        life,
        time,
        buyableEffects,
        display: jsx(() => (
            <>
                <MainDisplay resource={life} color={color} />
                {render(resetButton)}
                <br />
                <br />
                <table>
                    <tbody>
                        <tr>
                            <td>{render(buyables[0])}</td>
                            <td>{render(buyables[1])}</td>
                            <td>{render(buyables[2])}</td>
                        </tr>
                        <tr>
                            <td>{render(buyables[3])}</td>
                            <td>{render(buyables[4])}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        )),
        treeNode,
        buyables
    };
});

export default layer;
