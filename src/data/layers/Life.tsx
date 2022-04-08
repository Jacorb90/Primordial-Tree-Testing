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
import lightning from "./Lightning";

const layer = createLayer(() => {
    const id = "l";
    const name = "Life";
    const color = "#32a85e";

    const life = createResource<DecimalSource>(0, "Life Particles");
    const best = trackBest(life);

    const gainMult = computed(() => {
        let mult = Decimal.dOne;

        if (lightning.lightningSel.value == 2)
            mult = mult.times(lightning.clickableEffects.value[2]);

        return mult;
    });

    const conversion = createCumulativeConversion(() => ({
        scaling: createPolynomialScaling(10, 1 / 3),
        baseResource: main.particles,
        gainResource: life,
        roundUpCost: true,
        gainModifier: {
            apply: gain => Decimal.mul(gain, gainMult.value),
            revert: gain => Decimal.div(gain, gainMult.value)
        }
    }));

    const buyableEffects = computed(() => ({
        1: Decimal.pow(2, buyables[1].amount.value),
        2: Decimal.mul(2, buyables[2].amount.value)
    }));

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
                return Decimal.pow(3, amt);
            },
            resource: life,
            display: {
                title: "Regeneration",
                description: "Generate 1 Particle/second."
            }
        })),
        createBuyable(() => ({
            visibility: () =>
                Decimal.gt(buyables[0].amount.value, 0) ? Visibility.Visible : Visibility.None,
            cost() {
                const amt = buyables[1].amount.value;
                return Decimal.pow(4, Decimal.pow(amt, 1.2)).times(10);
            },
            resource: life,
            display: () => ({
                title: "The Source",
                description: "Double Particle gain.",
                effectDisplay: format(buyableEffects.value[1]) + "x"
            })
        })),
        createBuyable(() => ({
            visibility: () =>
                Decimal.gt(buyables[1].amount.value, 0) ? Visibility.Visible : Visibility.None,
            cost() {
                const amt = buyables[2].amount.value;
                return Decimal.pow(2.5, Decimal.pow(amt, 1.4)).times(50);
            },
            resource: life,
            display: () => ({
                title: "Solar Warmth",
                description: "Flame Upgrade 1's effect increases by 2.",
                effectDisplay: "+" + format(buyableEffects.value[2])
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
        buyableEffects,
        display: jsx(() => (
            <>
                <MainDisplay resource={life} color={color} />
                {render(resetButton)}
                <br />
                <br />
                {buyables.map(bbl => render(bbl))}
            </>
        )),
        treeNode,
        buyables
    };
});

export default layer;
