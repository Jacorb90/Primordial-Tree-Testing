/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion, createPolynomialScaling } from "features/conversion";
import { CoercableComponent, jsx, Visibility } from "features/feature";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, Resource, trackBest } from "features/resources/resource";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createUpgrade, Upgrade } from "features/upgrades/upgrade";
import { Computable } from "util/computed";
import { format, formatWhole } from "util/break_eternity";
import { computed } from "vue";
import life from "./Life";
import lightning from "./Lightning";

const layer = createLayer(() => {
    const id = "f";
    const name = "Flame";
    const color = "#fc3b00";

    const flame = createResource<DecimalSource>(0, "Flame Particles");
    const best = trackBest(flame);

    const gainMult = computed(() => {
        let mult = Decimal.dOne;

        if (lightning.lightningSel.value == 2)
            mult = mult.times(lightning.clickableEffects.value[2]);

        return mult;
    });

    const conversion = createCumulativeConversion(() => ({
        scaling: createPolynomialScaling(10, 1 / 3),
        baseResource: main.particles,
        gainResource: flame,
        roundUpCost: true,
        gainModifier: {
            apply: gain => Decimal.mul(gain, gainMult.value),
            revert: gain => Decimal.div(gain, gainMult.value)
        }
    }));

    const upgradeEffects = {
        0: computed(() => {
            let ret = new Decimal(1);
            ret = ret.plus(life.buyableEffects.value[2]);
            return ret;
        }),
        1: computed(() => {
            return Decimal.add(flame.value, 1).log(20).plus(1);
        }),
        2: computed(() => {
            return Decimal.add(flame.value, 1).log(5).plus(1);
        })
    };

    const upgrades: Array<
        Upgrade<{
            visibility: () => Visibility;
            cost: DecimalSource;
            resource: Resource<DecimalSource>;
            display: Computable<{
                title: CoercableComponent;
                description: CoercableComponent;
                effectDisplay?: CoercableComponent;
            }>;
        }>
    > = [
        createUpgrade(() => ({
            visibility: () => (Decimal.gt(best.value, 0) ? Visibility.Visible : Visibility.None),
            cost: 1,
            resource: flame,
            display: computed(() => ({
                title: "A Hot Start",
                description:
                    "Generate " + formatWhole(upgradeEffects[0].value) + " Particles/second."
            }))
        })),
        createUpgrade(() => ({
            visibility: () => (upgrades[0].bought.value ? Visibility.Visible : Visibility.None),
            cost: 5,
            resource: flame,
            display: () => ({
                title: "Heat = Speed",
                description: "Flame Particles multiply Particle gain at a reduced rate.",
                effectDisplay: format(upgradeEffects[1].value, 2) + "x"
            })
        })),
        createUpgrade(() => ({
            visibility: () => (upgrades[1].bought.value ? Visibility.Visible : Visibility.None),
            cost: 30,
            resource: flame,
            display: () => ({
                title: "Liquid Fire",
                description: "Flame Particles make the Bubble bar faster.",
                effectDisplay: format(upgradeEffects[2].value, 2) + "x"
            })
        }))
    ];

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        display: jsx(() => <img src="/nodes/flame.png" />),
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
        flame,
        upgradeEffects,
        display: jsx(() => (
            <>
                <MainDisplay resource={flame} color={color} />
                {render(resetButton)}
                <br />
                <br />
                <table>
                    <tbody>
                        <tr>
                            {upgrades.map(upg => (
                                <td>{render(upg)}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </>
        )),
        treeNode,
        upgrades
    };
});

export default layer;
