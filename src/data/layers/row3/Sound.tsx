/**
 * @module
 * @hidden
 */

import {
    createLayerTreeNode,
    createResetButton,
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
import { Visibility, jsx, showIf } from "features/feature";
import { createReset } from "features/reset";
import { createResource, trackBest } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource } from "lib/break_eternity";
import MainDisplay from "features/resources/MainDisplay.vue";
import air from "../row2/Air";
import advancements from "../side/Advancements";
import { render } from "util/vue";
import light from "./Light";
import { globalBus } from "game/events";
import { createUpgrade, Upgrade, UpgradeOptions } from "features/upgrades/upgrade";
import { computed } from "vue";
import { format } from "util/break_eternity";
import { createSequentialModifier, createMultiplicativeModifier, createModifierSection } from "game/modifiers";
import { Modifier } from "../../../game/modifiers";
import { Direction } from "util/common";

const layer = createLayer("sound", () => {
    const id = "sound";
    const name = "Sound";
    const color = "#ddcfff";

    const sound = createResource<DecimalSource>(0, "Sound Particles");
    const best = trackBest(sound);

    const conversion: Conversion<ConversionOptions & { gainModifier: Required<Modifier> }> = createConversion(() => ({
        scaling: createPolynomialScaling(() => 1e7, 1 / 3),
        baseResource: air.air,
        gainResource: sound,
        gainModifier: createSequentialModifier(
            createMultiplicativeModifier(
                advancements.adv48eff,
                "Advancement 48",
                advancements.milestones[47].earned
            )
        )
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        visibility: () =>
            advancements.milestones[32].earned.value ? Visibility.Visible : Visibility.Hidden,
        layerID: id,
        display: jsx(() => <img src="./nodes/sound.png" />),
        color,
        reset
    }));
    addTooltip(treeNode, {
        display: createResourceTooltip(sound),
        pinnable: true,
        style: () => (treeNode.visibility.value === Visibility.Visible ? "" : "display: none")
    });

    const resetButton: ResetButton<ResetButtonOptions> = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));
    addTooltip(resetButton, {
        display: jsx(() =>
            createModifierSection(
                "Modifiers",
                "",
                conversion.gainModifier,
                conversion.scaling.currentGain(conversion)
            )
        ),
        pinnable: true,
        direction: Direction.Down,
        style: "width: 400px; text-align: left"
    });


    const ultrasound = createResource<DecimalSource>(0, "Ultrasound");

    const ultrasoundGainMult = computed(() => {
        let mult = Decimal.dOne;

        if (Decimal.gte(light.lights[3].buyables[1].amount.value, 1))
            mult = mult.times(light.lightBuyableEffects[3][1].value);

        if (upgrades[3].bought.value) mult = mult.times(upgradeEffects[3].value);
        if (advancements.milestones[37].earned.value) mult = mult.times(2);

        for (let i=0; i<6; i++) {
            if (row2upgrades[i].bought.value) mult = mult.times(i == 2 ? upgradeEffects[i].value.plus(1) : upgradeEffects[i].value);
        }

        return mult;
    });

    const upgradeEffects = [
        computed(() => Decimal.add(ultrasound.value, 1).log10().plus(1).log10().plus(1).times(row2upgrades[0].bought.value ? row2upgradeEffects[0].value : 1)),
        computed(() => Decimal.add(ultrasound.value, 1).log10().plus(1).sqrt().times(row2upgrades[1].bought.value ? row2upgradeEffects[1].value : 1)),
        computed(() => {
            let ret = Decimal.add(ultrasound.value, 1).times(row2upgrades[2].bought.value ? row2upgradeEffects[2].value : 1).log10().div(20);
            if (ret.gte(0.5)) ret = ret.plus(0.5).log10().plus(0.5);
            return ret;
        }),
        computed(() => Decimal.add(ultrasound.value, 1).log10().plus(1).sqrt().times(row2upgrades[3].bought.value ? row2upgradeEffects[3].value : 1)),
        computed(() => Decimal.add(ultrasound.value, 1).log10().plus(1).times(row2upgrades[4].bought.value ? row2upgradeEffects[4].value : 1)),
        computed(() => Decimal.div(ultrasound.value, 100).plus(1).times(row2upgrades[5].bought.value ? row2upgradeEffects[5].value : 1))
    ];

    const row2upgradeEffects = [
        computed(() => Decimal.add(sound.value, 1).log10().plus(1).log10().plus(1).root(1.5)),
        computed(() => Decimal.add(sound.value, 1).log10().plus(1).cbrt()),
        computed(() => Decimal.add(sound.value, 1).sqrt()),
        computed(() => Decimal.add(sound.value, 1).log10().plus(1).cbrt()),
        computed(() => Decimal.add(sound.value, 1).log10().plus(1).root(1.5)),
        computed(() => Decimal.div(sound.value, 100).plus(1).log10().plus(1))
    ]

    const upgrades: Upgrade<UpgradeOptions>[] = [
        createUpgrade(() => ({
            display: () => ({
                title: "Pitch",
                description:
                    "Ultrasound boosts the gain speed of all Light Energy colors at a very reduced rate.",
                effectDisplay: format(upgradeEffects[0].value) + "x"
            }),
            cost: 100,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Duration",
                description: "Ultrasound boosts Wind/Zephyr/Tornado speeds at a reduced rate.",
                effectDisplay: format(upgradeEffects[1].value) + "x"
            }),
            cost: 1e3,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Volume",
                description: "Ultrasound boosts Life Buyable Power at a reduced rate.",
                effectDisplay: "+" + format(Decimal.mul(upgradeEffects[2].value, 100)) + "%"
            }),
            cost: 2.5e3,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Timbre",
                description: "Ultrasound boosts its own gain at a reduced rate.",
                effectDisplay: format(upgradeEffects[3].value) + "x"
            }),
            cost: 1e4,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Texture",
                description: "Ultrasound boosts Flame Particle gain at a reduced rate.",
                effectDisplay: format(upgradeEffects[4].value) + "x"
            }),
            cost: 1e5,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Location",
                description: "Ultrasound boosts Aqua bar speed.",
                effectDisplay: format(upgradeEffects[5].value) + "x"
            }),
            cost: 4e5,
            resource: ultrasound
        }))
    ];

    const row2upgrades: Upgrade<UpgradeOptions>[] = [
        createUpgrade(() => ({
            display: () => ({
                title: "Pitch II",
                description:
                    "Sound Particles boost the above upgrade's effect, which now also boosts Ultrasound gain.",
                effectDisplay: format(row2upgradeEffects[0].value) + "x"
            }),
            cost: 1e6,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Duration II",
                description:
                    "Sound Particles boost the above upgrade's effect, which now also boosts Ultrasound gain.",
                effectDisplay: format(row2upgradeEffects[1].value) + "x"
            }),
            cost: 5e6,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Volume II",
                description:
                    "Sound Particles boost effective Ultrasound in the above upgrade, which now also boosts Ultrasound gain.",
                effectDisplay: format(row2upgradeEffects[2].value) + "x"
            }),
            cost: 4e7,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Timbre II",
                description:
                    "Sound Particles boost the above upgrade's effect, which now also boosts Ultrasound gain.",
                effectDisplay: format(row2upgradeEffects[3].value) + "x"
            }),
            cost: 6e8,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Texture II",
                description:
                    "Sound Particles boost the above upgrade's effect, which now also boosts Ultrasound gain.",
                effectDisplay: format(row2upgradeEffects[4].value) + "x"
            }),
            cost: 1e10,
            resource: ultrasound
        })),
        createUpgrade(() => ({
            display: () => ({
                title: "Location II",
                description:
                    "Sound Particles boost the above upgrade's effect, which now also boosts Ultrasound gain.",
                effectDisplay: format(row2upgradeEffects[5].value) + "x"
            }),
            cost: 1e12,
            resource: ultrasound
        }))
    ]

    globalBus.on("update", diff => {
        ultrasound.value = Decimal.add(
            ultrasound.value,
            Decimal.mul(sound.value, diff).times(ultrasoundGainMult.value)
        );
    });

    return {
        id,
        name,
        color,
        sound,
        best,
        ultrasound,
        upgrades,
        upgradeEffects,
        row2upgrades,
        row2upgradeEffects,
        display: jsx(() => (
            <>
                <MainDisplay resource={sound} color={color} />
                {render(resetButton)}
                <br />
                There is {format(ultrasound.value)} Ultrasound (generated by Sound Particles)
                <br />
                <br />
                {upgrades.map(render)}
                <br />
                {advancements.milestones[49].earned.value ? row2upgrades.map(render) : []}
            </>
        )),
        treeNode
    };
});

export default layer;
