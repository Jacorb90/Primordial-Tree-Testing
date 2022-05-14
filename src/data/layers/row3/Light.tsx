/**
 * @module
 * @hidden
 */

import {
    createLayerTreeNode,
    createResetButton,
    LayerTreeNode,
    LayerTreeNodeOptions,
    ResetButton,
    ResetButtonOptions
} from "data/common";
import { main } from "data/projEntry";
import {
    Conversion,
    ConversionOptions,
    createConversion,
    createPolynomialScaling
} from "features/conversion";
import { Visibility, jsx, JSXFunction, showIf } from "features/feature";
import { createReset, Reset, ResetOptions } from "features/reset";
import { createResource, Resource, trackBest } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource } from "lib/break_eternity";
import MainDisplay from "features/resources/MainDisplay.vue";
import lightning from "../row2/Lightning";
import advancements from "../side/Advancements";
import { render } from "util/vue";
import sound from "./Sound";
import { createTab, Tab, TabOptions } from "features/tabs/tab";
import { Buyable, BuyableDisplay, BuyableOptions, createBuyable } from "features/buyable";
import { Computable } from "util/computed";
import { computed, ComputedRef } from "vue";
import { format } from "util/bignum";
import { globalBus } from "game/events";
import {
    createTabFamily,
    TabFamily,
    TabFamilyOptions,
    TabButtonOptions
} from "features/tabs/tabFamily";
import combinators from "../row4/Combinators";

interface LightData {
    energy: Resource<DecimalSource>;
    gainMult: ComputedRef<Decimal>;
    buyables: Buyable<BuyableOptions & { visibility: () => Visibility }>[];
    tab: Tab<TabOptions>;
}

const layer = createLayer("light", () => {
    const id = "light";
    const name = "Light";
    const color = "#fff5c9";

    const light = createResource<DecimalSource>(0, "Light Particles");
    const best = trackBest(light);

    const conversion: Conversion<ConversionOptions> = createConversion(() => ({
        scaling: createPolynomialScaling(() => 1e9, 1 / 3),
        baseResource: lightning.lightning,
        gainResource: light
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode: LayerTreeNode<{
        visibility: () => Visibility;
        layerID: string;
        display: JSXFunction;
        color: string;
        reset: Reset<ResetOptions>;
    }> = createLayerTreeNode(() => ({
        visibility: () =>
            advancements.milestones[32].earned.value ? Visibility.Visible : Visibility.Hidden,
        layerID: id,
        display: jsx(() => <img src="./nodes/light.png" />),
        color,
        reset
    }));
    addTooltip(treeNode, {
        display: createResourceTooltip(light),
        pinnable: true,
        style: () => (treeNode.visibility.value === Visibility.Visible ? "" : "display: none")
    });

    const resetButton: ResetButton<ResetButtonOptions> = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));

    const colorNames = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"];
    const lightColors = [
        "#FF0000",
        "#FF7F00",
        "#FFFF00",
        "#00FF00",
        "#0000FF",
        "#4B0082",
        "#9400D3"
    ];
    const darkColors = [
        "#770000",
        "#773700",
        "#777700",
        "#007700",
        "#000077",
        "#250041",
        "#420061"
    ];

    const lightBuyableEffects: ComputedRef<DecimalSource>[][] = [
        [
            computed(() => lights[0].buyables[0].amount.value),
            computed(() =>
                Decimal.add(lights[0].energy.value, 1)
                    .log10()
                    .div(10)
                    .plus(1)
                    .pow(Decimal.add(lights[0].buyables[1].amount.value, 1).log2())
            )
        ],
        [
            computed(() =>
                Decimal.pow(10, Decimal.add(lights[0].energy.value, 1).log10().sqrt())
                    .sub(1)
                    .cbrt()
                    .times(lights[1].buyables[0].amount.value)
                    .div(10)
            ),
            computed(() =>
                Decimal.add(lights[1].energy.value, 1)
                    .log10()
                    .times(Decimal.add(lights[1].buyables[1].amount.value, 1).log2())
                    .times(5)
            ),
            computed(() =>
                Decimal.add(lights[1].energy.value, 1)
                    .log10()
                    .sqrt()
                    .times(lights[1].buyables[2].amount.value)
                    .plus(1)
            )
        ],
        [
            computed(() =>
                Decimal.pow(10, Decimal.add(light.value, 1).log10().cbrt())
                    .sub(1)
                    .root(4)
                    .times(lights[2].buyables[0].amount.value)
                    .div(7.5)
            ),
            computed(() =>
                Decimal.add(lights[2].energy.value, 1)
                    .log10()
                    .times(Decimal.add(lights[2].buyables[1].amount.value, 1).log2())
                    .div(2)
                    .plus(1)
                    .sqrt()
            ),
            computed(() =>
                Decimal.add(lights[2].energy.value, 1)
                    .log10()
                    .sqrt()
                    .times(lights[2].buyables[2].amount.value)
                    .div(2)
                    .plus(1)
            )
        ],
        [
            computed(() =>
                Decimal.pow(10, Decimal.sqrt(combinators.combinators.value))
                    .sub(1)
                    .root(5)
                    .times(lights[3].buyables[0].amount.value)
                    .div(40)
            ),
            computed(() =>
                Decimal.add(lights[3].energy.value, 1)
                    .log10()
                    .times(Decimal.add(lights[3].buyables[1].amount.value, 1).log2())
                    .div(1.5)
                    .plus(1)
                    .root(2.5)
            ),
            computed(() =>
                Decimal.add(lights[3].energy.value, 1)
                    .log10()
                    .sqrt()
                    .times(lights[3].buyables[2].amount.value)
                    .div(3)
                    .plus(1)
            )
        ]
    ];

    const lightBuyableData: Computable<BuyableDisplay>[][] = [
        [
            () => ({
                title: "Passion Bright",
                description: "Generate 1 Red Energy every second.",
                effectDisplay: format(lightBuyableEffects[0][0].value) + "/s"
            }),
            () => ({
                title: "Blinding Light",
                description: "Red Energy boosts Particle gain.",
                effectDisplay: format(lightBuyableEffects[0][1].value) + "x"
            })
        ],
        [
            () => ({
                title: "Peace and Quiet",
                description: "Generate Orange Energy over time based on Red Energy.",
                effectDisplay: format(lightBuyableEffects[1][0].value) + "/s"
            }),
            () => ({
                title: "Sunset Sight",
                description: "Orange Energy adds to Base Particle gain.",
                effectDisplay: "+" + format(lightBuyableEffects[1][1].value)
            }),
            () => ({
                title: "Furious Height",
                description: "Orange Energy boosts Red Energy gain at a reduced rate.",
                effectDisplay: format(lightBuyableEffects[1][2].value) + "x"
            })
        ],
        [
            () => ({
                title: "Shattered Dreams",
                description: "Generate Yellow Energy over time based on Light Particles.",
                effectDisplay: format(lightBuyableEffects[2][0].value) + "/s"
            }),
            () => ({
                title: "Thunderous Streams",
                description: "Yellow Energy boosts Lightning Particle gain.",
                effectDisplay: format(lightBuyableEffects[2][1].value) + "x"
            }),
            () => ({
                title: "Frightened Screams",
                description: "Yellow Energy boosts Orange Energy gain at a reduced rate.",
                effectDisplay: format(lightBuyableEffects[2][2].value) + "x"
            })
        ],
        [
            () => ({
                title: "Beautiful Fragrance",
                description: "Generate Green Energy over time based on Combinators.",
                effectDisplay: format(lightBuyableEffects[3][0].value) + "/s"
            }),
            () => ({
                title: "Quantum Condensed",
                description: "Green Energy boosts Ultrasound gain.",
                effectDisplay: format(lightBuyableEffects[3][1].value) + "x"
            }),
            () => ({
                title: "Calm Sense",
                description: "Green Energy boosts Yellow Energy gain at a reduced rate.",
                effectDisplay: format(lightBuyableEffects[3][2].value) + "x"
            })
        ],
        [],
        [],
        []
    ];

    const lights: LightData[] = [...new Array(7)].map((_, index) => {
        const energy = createResource<DecimalSource>(0, colorNames[index] + " Energy");

        const gainMult = computed(() => {
            let mult = Decimal.dOne;

            if (sound.upgrades[0].bought.value) mult = mult.times(sound.upgradeEffects[0].value);
            if (advancements.milestones[33].earned.value) mult = mult.times(2);
            if (advancements.milestones[35].earned.value) mult = mult.times(3);

            if (index == 0) mult = mult.times(lightBuyableEffects[1][2].value);
            if (index == 1) mult = mult.times(lightBuyableEffects[2][2].value);
            if (index == 2) mult = mult.times(lightBuyableEffects[3][2].value);

            return mult;
        });

        const buyables: Buyable<BuyableOptions & { visibility: () => Visibility }>[] = [
            ...new Array(lightBuyableData[index].length)
        ].map((_, bIndex) =>
            createBuyable(() => ({
                visibility: () =>
                    bIndex == 0
                        ? Visibility.Visible
                        : showIf(Decimal.gte(buyables[bIndex - 1].amount.value, 1)),
                cost: () =>
                    Decimal.pow(
                        index / 4 + bIndex / 2 + 2,
                        Decimal.pow(
                            buyables[bIndex].amount.value,
                            1 + (Math.sqrt(index) + bIndex) / 10
                        ).plus((Math.sqrt(index) / 4 + Math.sqrt(bIndex)) * 3)
                    ),
                resource: bIndex == 0 ? light : energy,
                display: lightBuyableData[index][bIndex]
            }))
        );

        const tab = createTab(() => ({
            display: jsx(() => (
                <>
                    <h3>
                        There is {format(energy.value)} {colorNames[index]} Energy
                    </h3>
                    <br />
                    {buyables.map(render)}
                </>
            )),
            style: {
                backgroundColor: darkColors[index],
                color: lightColors[index]
            }
        }));

        return {
            energy,
            gainMult,
            buyables,
            tab
        };
    });

    const tabFamily: TabFamily<TabFamilyOptions> = createTabFamily(
        [...new Array(7)]
            .map<[string, () => TabButtonOptions]>((_, index) => [
                colorNames[index],
                () =>
                    ({
                        visibility: () =>
                            index == 0
                                ? Visibility.Visible
                                : showIf(
                                      lights[index].buyables.length > 0 &&
                                          lights[index - 1].buyables.every(bbl =>
                                              Decimal.gte(bbl.amount.value, 1)
                                          )
                                  ),
                        tab: lights[index].tab,
                        display: colorNames[index],
                        style: () => ({
                            borderColor: lightColors[index]
                        })
                    } as TabButtonOptions)
            ])
            .reduce<{ [key: string]: () => TabButtonOptions }>(
                (acc, [key, value]) => ({ ...acc, [key]: value }),
                {}
            )
    );

    globalBus.on("update", diff => {
        for (let i = 0; i <= 3; i++)
            lights[i].energy.value = Decimal.add(
                lights[i].energy.value,
                Decimal.mul(lightBuyableEffects[i][0].value, diff).times(lights[i].gainMult.value)
            );
    });

    return {
        id,
        name,
        color,
        light,
        best,
        lights,
        lightBuyableEffects,
        tabFamily,
        display: jsx(() => (
            <>
                <MainDisplay resource={light} color={color} />
                {render(resetButton)}
                <br />
                <br />
                {render(tabFamily)}
            </>
        )),
        treeNode
    };
});

export default layer;
