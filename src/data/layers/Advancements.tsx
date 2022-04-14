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
import Decimal, { DecimalSource } from "lib/break_eternity";
import { render } from "util/vue";
import { jsx, Visibility } from "features/feature";
import { createMilestone } from "features/milestones/milestone";
import { computed } from "vue";
import { format, formatWhole } from "util/break_eternity";

const layer = createLayer(() => {
    const id = "adv";
    const name = "Advancements";
    const color = "#ffffff";

    const reqs = [125, 700, 2e3, 5e3, 2.5e4, 3.6e4, 6e4, 8.85e5, 2.25e6, 4.35e6, 3.25e7, 1 / 0];

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

    const adv5time = computed(() => {
        let time: DecimalSource = 120;

        if (milestones[8].earned.value)
            time = Decimal.sub(advancements.value, 7).times(30).plus(time);

        return time;
    });

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
                        Flame, Life, and Aqua Particle gain is tripled for the first{" "}
                        {formatWhole(adv5time.value)} seconds of a run.
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
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 7) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 7);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>7 Advancements</h3>
                        <br />
                        Unlock Air
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 8) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 8);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>8 Advancements</h3>
                        <br />
                        Unlock a new Aqua Bar
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 9) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 9);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>9 Advancements</h3>
                        <br />
                        The milestone at 5 Advancements lasts 30 seconds longer per Advancement
                        after 7
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 10) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 10);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>10 Advancements</h3>
                        <br />
                        Purchasing Life Buyables does not spend Life Particles
                    </>
                ))
            }
        })),
        createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, 11) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, 11);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>11 Advancements</h3>
                        <br />
                        The Air requirement uses a more efficient formula, you can buy max Air, and
                        you can buy all Life Buyables at once.
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
        adv5time,
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
