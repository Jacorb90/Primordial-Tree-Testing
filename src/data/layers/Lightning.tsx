/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion, createPolynomialScaling } from "features/conversion";
import { jsx, Visibility } from "features/feature";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, trackBest } from "features/resources/resource";
import { createLayer } from "game/layers";
import { DecimalSource } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createClickable } from "features/clickables/clickable";
import { computed, ref } from "vue";
import advancements from "./Advancements";
import Decimal from "lib/break_eternity";
import { format } from "util/break_eternity";

const layer = createLayer(() => {
    const id = "li";
    const name = "Lightning";
    const color = "#ffd500";

    const lightning = createResource<DecimalSource>(0, "Lightning Particles");
    const best = trackBest(lightning);
    const lightningSel = createResource<number>(0);

    const conversion = createCumulativeConversion(() => ({
        scaling: createPolynomialScaling(2.5e3, 1 / 6),
        baseResource: main.particles,
        gainResource: lightning,
        roundUpCost: true
    }));

    const clickableEffects = computed(() => ({
        0: Decimal.add(lightning.value, 1).log2().times(2),
        1: Decimal.add(lightning.value, 1).sqrt(),
        2: Decimal.add(lightning.value, 1).log(3).plus(1).sqrt()
    }));

    const clickables = [
        createClickable(() => ({
            visibility: () => (Decimal.gte(best.value, 1) ? Visibility.Visible : Visibility.None),
            canClick: () => lightningSel.value != 0,
            onClick: _ => {
                lightningSel.value = 0;
            },
            display: () => ({
                title: "Lightning Mode A" + (lightningSel.value == 0 ? " (Active)" : ""),
                description:
                    "Increase Particle gain based on Lightning Particles (Currently: +" +
                    format(clickableEffects.value[0], 1) +
                    ")"
            })
        })),
        createClickable(() => ({
            visibility: () => (Decimal.gte(best.value, 1) ? Visibility.Visible : Visibility.None),
            canClick: () => lightningSel.value != 1,
            onClick: _ => {
                lightningSel.value = 1;
            },
            display: () => ({
                title: "Lightning Mode B" + (lightningSel.value == 1 ? " (Active)" : ""),
                description:
                    "Multiply Particle gain based on Lightning Particles (Currently: x" +
                    format(clickableEffects.value[1], 2) +
                    ")"
            })
        })),
        createClickable(() => ({
            visibility: () => (Decimal.gte(best.value, 2) ? Visibility.Visible : Visibility.None),
            canClick: () => lightningSel.value != 2,
            onClick: _ => {
                lightningSel.value = 2;
            },
            display: () => ({
                title: "Lightning Mode C" + (lightningSel.value == 2 ? " (Active)" : ""),
                description:
                    "Multiply Flame, Life, & Aqua Particle gain based on Lightning Particles (Currently: x" +
                    format(clickableEffects.value[2], 2) +
                    ")"
            })
        }))
    ];

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        visibility: () =>
            advancements.milestones[0].earned.value ? Visibility.Visible : Visibility.Hidden,
        layerID: id,
        display: jsx(() => <img src="/nodes/lightning.png" />),
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
        lightning,
        lightningSel,
        display: jsx(() => (
            <>
                <MainDisplay resource={lightning} color={color} />
                {render(resetButton)}
                <br />
                <br />
                <table>
                    <tbody>
                        <tr>
                            {clickables.map(clk => (
                                <td>{render(clk)}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </>
        )),
        treeNode,
        clickables,
        clickableEffects
    };
});

export default layer;
