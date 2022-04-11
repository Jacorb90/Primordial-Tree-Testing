/**
 * @module
 * @hidden
 */

import { createLayerTreeNode, createResetButton } from "data/common";
import { main } from "data/projEntry";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createCumulativeConversion } from "features/conversion";
import { createReset } from "features/reset";
import { createResource } from "features/resources/resource";
import { createLayer } from "game/layers";
import Decimal from "lib/break_eternity";
import { render } from "util/vue";
import { jsx, Visibility } from "features/feature";
import { createMilestone } from "features/milestones/milestone";

const layer = createLayer(() => {
    const id = "adv";
    const name = "Advancements";
    const color = "#ffffff";

    const reqs = [125, 700, 2e3, 5e3, 2.5e4, 3.6e4, 1 / 0];

    const advancements = createResource<number>(0, "Advancements");

    const conversion = createCumulativeConversion(() => ({
        scaling: {
            currentGain: conv =>
                Decimal.gte(
                    conv.baseResource.value,
                    reqs[new Decimal(conv.gainResource.value).toNumber()]
                )
                    ? 1
                    : 0,
            nextAt: conv => reqs[new Decimal(conv.gainResource.value).toNumber()]
        },
        baseResource: main.particleGain,
        gainResource: advancements,
        roundUpCost: true,
        buyMax: false
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        display: "A",
        color,
        reset
    }));

    const resetButton = createResetButton(() => ({
        conversion,
        displayName: "particles/s",
        tree: main.tree,
        treeNode
    }));

    const milestones = [
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 1) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 1);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>1 Advancement</h3>
                        <br />
                        Unlock Lightning
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 2) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 2);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>2 Advancements</h3>
                        <br />
                        Unlock a new row of Flame Upgrades
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 3) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 3);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>3 Advancements</h3>
                        <br />
                        Unlock Cryo
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 4) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 4);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>4 Advancements</h3>
                        <br />
                        Gain 100% of Flame, Life, and Aqua Particles every second.
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 5) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 5);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>5 Advancements</h3>
                        <br />
                        Flame, Life, and Aqua Particle gain is tripled for the first 2 minutes of a
                        run.
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 6) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 6);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>6 Advancements</h3>
                        <br />
                        Unlock a new row of Life Buyables
                    </>
                ))
            }
        }))
    ];

    return {
        id,
        name,
        color,
        advancements,
        display: jsx(() => (
            <>
                <MainDisplay resource={advancements} color={color} />
                {render(resetButton)}
                <br />
                <br />
                <table>
                    <tbody>
                        {milestones.map(m => (
                            <tr>
                                <td>{render(m)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        )),
        treeNode,
        milestones
    };
});

export default layer;
