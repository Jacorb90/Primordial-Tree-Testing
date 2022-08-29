/**
 * @module
 * @hidden
 */

import { computed } from "@vue/reactivity";
import { unref } from "vue";
import { main } from "data/projEntry";
import { jsx, showIf, Visibility } from "features/feature";
import { createReset } from "features/reset";
import { createResource } from "features/resources/resource";
import { createLayerTreeNode } from "../../common";
import { createLayer } from "game/layers";
import Decimal from "lib/break_eternity";
import { DecimalSource, format, formatWhole } from "util/bignum";
import advancements from "./Advancements";
import { createUpgrade, Upgrade, UpgradeOptions } from "features/upgrades/upgrade";
import { render } from "util/vue";
import flame from "../row1/Flame";
import life from "../row1/Life";
import aqua from "../row1/Aqua";
import { createClickable } from "features/clickables/clickable";
import { addTooltip } from "features/tooltips/tooltip";
import { Direction } from "util/common";

type VoidDecayTypes = "flame" | "life" | "aqua";

const layer = createLayer("v", () => {
    const id = "v";
    const name = "Void";
    const color = "#240040";

    const spentDarkMatter = createResource<DecimalSource>(0);

    const darkMatter = computed(() => {
        const particles = main.best.value;
        return Decimal.div(particles, 1e45).root(10).sub(spentDarkMatter.value).floor().max(0);
    });

    const nextDarkMatter = computed(() => {
        const dm = Decimal.add(darkMatter.value, 1).plus(spentDarkMatter.value);
        return dm.pow(10).times(1e45);
    })

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        display: jsx(() => <img src="./nodes/void.png" />),
        visibility: () => showIf(advancements.milestones[44].earned.value),
        color,
        reset
    }));
    addTooltip(treeNode, {
        display: computed(() => `${formatWhole(darkMatter.value)} Dark Matter`),
        pinnable: true,
        direction: Direction.Left,
        style: () => (treeNode.visibility.value === Visibility.Visible ? "" : "display: none")
    });

    const voidDecayRows: VoidDecayTypes[][] = [
        ["flame", "life", "aqua"]
    ];

    const resetVoidDecays = createClickable(() => ({
        canClick: () => voidDecayCount.value > 0,
        display: jsx(() => <div style="font-size: 1.33em; font-weight: bold;">Reset Void Decays</div>),
        small: true,
        onClick: _ => {
            Object.values(voidDecays).forEach(decay => {
                decay.bought.value = false;
            });
            spentDarkMatter.value = 0;
        },
        style: {
            color: "white"
        }
    }));

    const voidDecays: Record<VoidDecayTypes, Upgrade<UpgradeOptions>> = {
        flame: createUpgrade(() => ({
            display: {
                title: "Flame Decay",
                description: jsx(() => 
                    <div>Cost: {formatWhole(unref(voidDecays.flame.cost) ?? "Infinity")} Dark Matter</div>
                )
            },
            cost: () => Decimal.pow(5, voidDecayCount.value - (voidDecays.flame.bought.value ? 1 : 0)),
            canAfford: () => Decimal.gte(darkMatter.value, unref(voidDecays.flame.cost) ?? "Infinity"),
            onPurchase: () => {
                spentDarkMatter.value = Decimal.add(spentDarkMatter.value, unref(voidDecays.flame.cost) ?? 0);
                flame.treeNode.reset.reset();
            },
            style: {
                color: "white"
            }
        })),
        life: createUpgrade(() => ({
            display: {
                title: "Life Decay",
                description: jsx(() => 
                    <div>Cost: {formatWhole(unref(voidDecays.life.cost) ?? "Infinity")} Dark Matter</div>
                )
            },
            cost: () => Decimal.pow(5, voidDecayCount.value - (voidDecays.life.bought.value ? 1 : 0)),
            canAfford: () => Decimal.gte(darkMatter.value, unref(voidDecays.life.cost) ?? "Infinity"),
            onPurchase: () => {
                spentDarkMatter.value = Decimal.add(spentDarkMatter.value, unref(voidDecays.life.cost) ?? 0);
                life.treeNode.reset.reset();
            },
            style: {
                color: "white"
            }
        })),
        aqua: createUpgrade(() => ({
            display: {
                title: "Aqua Decay",
                description: jsx(() => 
                    <div>Cost: {formatWhole(unref(voidDecays.aqua.cost) ?? "Infinity")} Dark Matter</div>
                )
            },
            cost: () => Decimal.pow(5, voidDecayCount.value - (voidDecays.aqua.bought.value ? 1 : 0)),
            canAfford: () => Decimal.gte(darkMatter.value, unref(voidDecays.aqua.cost) ?? "Infinity"),
            onPurchase: () => {
                spentDarkMatter.value = Decimal.add(spentDarkMatter.value, unref(voidDecays.aqua.cost) ?? 0);
                aqua.treeNode.reset.reset();
            },
            style: {
                color: "white"
            }
        }))
    }

    const voidDecayCount = computed(() => Object.values(voidDecays).filter(decay => decay.bought.value).length);

    return {
        id,
        name,
        color,
        darkMatter,
        nextDarkMatter,
        voidDecayCount,
        voidDecays,
        treeNode,
        display: jsx(() => (
            <>
                There are <span style={"color: " + color+"; font-size: 40px; font-weight: bold;"}>{formatWhole(voidDecayCount.value)}</span> Void-Decayed Particle types.<br/><br/>
                There is <span style={"color: " + color+"; font-size: 40px; font-weight: bold;"}>{formatWhole(darkMatter.value)}</span> Dark Matter (next at {format(nextDarkMatter.value)} Particles)<br/><br/>

                Void-Decaying a type of Particle will reset that layer entirely, and drastically nerf that layer, however all boosts it gives are much stronger, and any layers that are dependent on its particle scale much slower.<br/><br/>

                {render(resetVoidDecays)}

                <table>
                    {voidDecayRows.map(row => (
                        <tr>
                            {row.map(upgId => (
                                <td>{render(voidDecays[upgId])}</td>
                            ))}
                        </tr>
                    ))}
                </table>
            </>
        ))
    }
})

export default layer;