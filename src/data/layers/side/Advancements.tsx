/**
 * @module
 * @hidden
 */

import { createLayerTreeNode, createResetButton } from "data/common";
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { CoercableComponent, jsx, Visibility } from "features/feature";
import { createMilestone } from "features/milestones/milestone";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { Direction } from "util/common";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource } from "lib/break_eternity";
import { format } from "util/bignum";
import { formatWhole } from "util/break_eternity";
import { coerceComponent, render } from "util/vue";
import { computed, ComputedRef } from "vue";
import earth from "../row2/Earth";
import voidLayer from "./Void";

const layer = createLayer("adv", () => {
    const id = "adv";
    const name = "Advancements";
    const color = "#ffffff";

    const reqs = [
        125,
        700,
        2e3,
        5e3,
        2.5e4,
        3.6e4,
        6e4,
        8.85e5,
        2.25e6,
        4.35e6,
        3.25e7,
        4.05e7,
        55555555,
        1e9,
        2.35e9,
        3.25e9,
        1e10,
        2e10,
        1.25e11,
        2.5e13,
        6e13,
        1e14,
        5e14,
        1e17,
        1.2e18,
        4e18,
        1.5e19,
        1e20,
        5e21,
        4.5e22,
        1.35e23,
        1e24,
        1.4e25,
        1e27,
        1.2e28,
        6e28,
        5e30,
        2.5e32,
        2.25e36,
        5e37,
        2e39,
        7.2e41,
        1.33e45,
        3.5e46,
        5e46,
        1e49,
        "4e50",
        "6.75e51",
        "2e53",
        "2.5e53",
        "1.5e55",
        "2.5e57",
        "1.2e71",
        "4e73",
        "1e76",
        "1e82",
        "2.5e83",
        "1.5e86",
        "2e87",
        "1.4e89",
        "9e89",
        "4e91",
        "1e94",
        Decimal.dInf
    ];

    const advancements = createResource<number>(0, "Advancements");

    const conversion = createCumulativeConversion(() => ({
        scaling: {
            currentGain: conv =>
                Decimal.gte(
                    conv.baseResource.value,
                    reqs[new Decimal(conv.gainResource.value).toNumber()] || Decimal.dInf
                )
                    ? 1
                    : 0,
            currentAt: conv =>
                reqs[new Decimal(conv.gainResource.value).toNumber()] || Decimal.dInf,
            nextAt: conv => reqs[new Decimal(conv.gainResource.value).toNumber()] || Decimal.dInf
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
        reset,
        glowColor: () => (Decimal.gt(conversion.actualGain.value, 0) ? "red" : "")
    }));
    addTooltip(treeNode, {
        display: createResourceTooltip(advancements),
        pinnable: true,
        direction: Direction.Right
    });

    const resetButton = createResetButton(() => ({
        conversion,
        baseResourceName: "particles/s",
        tree: main.tree,
        treeNode
    }));

    const adv5time = computed(() => {
        let time: DecimalSource = 120;

        if (milestones[8].earned.value)
            time = Decimal.sub(advancements.value, 7).times(30).plus(time);
        if (milestones[30].earned.value) time = Infinity;

        return time;
    });

    const adv15eff: ComputedRef<Decimal> = computed(() => {
        return Decimal.pow(2, Decimal.root(earth.gridLevel.value, 1.5));
    });

    const adv37eff = computed(() => Decimal.pow(1.2, Decimal.sub(advancements.value, 35)));

    const adv48eff: ComputedRef<Decimal> = computed(() => Decimal.add(voidLayer.darkMatter.value, 1).log10().plus(1));

    const adv51eff: ComputedRef<Decimal> = computed(() => Decimal.pow(1.5, voidLayer.voidDecayCount.value));

    const adv56eff: ComputedRef<Decimal> = computed(() => Decimal.pow(1.02, earth.gridLevel.value));

    const adv57eff: ComputedRef<Decimal> = computed(() => Decimal.add(2, Decimal.div(Decimal.sub(advancements.value, 57), 10)));

    function createAdvancement(adv: DecimalSource, name: string, desc: CoercableComponent) {
        const Display = coerceComponent(desc);
        return createMilestone(() => ({
            visibility: () =>
                Decimal.gte(advancements.value, adv) ? Visibility.Visible : Visibility.None,
            shouldEarn() {
                return Decimal.gte(advancements.value, adv);
            },
            display: {
                requirement: jsx(() => (
                    <>
                        <h3>{name} [{formatWhole(adv)}]</h3>
                        <br />
                        <Display />
                    </>
                ))
            },
            style: {
                width: "30em"
            }
        }));
    }

    const milestoneData: [string, CoercableComponent][] = [
        ["Energetic Creation", "Unlock Lightning."],
        ["Heat Evolution", "Unlock a new row of Flame Upgrades."],
        ["Glacial Creation", "Unlock Cryo."],
        ["Elemental Automation", "Gain 100% of Flame, Life, and Aqua Particles every second."],
        ["Temporary Velocity", jsx(() => <span>Flame, Life, and Aqua Particle gain is tripled for the first{" "}{formatWhole(adv5time.value)} seconds of a run.</span>)],
        ["Tropical Evolution", "Unlock a new row of Life Buyables."],
        ["Pressure Creation", "Unlock Air."],
        ["Aquatic Evolution", "Unlock a new Aqua Bar."],
        ["Temporary Velocity II", "\"Temporary Velocity [5]\" lasts 30 seconds longer per Advancement after 7."],
        ["Complimentary Vines", "Purchasing Life Buyables does not spend Life Particles."],
        ["Pollen Evolution", "The Air requirement uses a more efficient formula, you can buy max Air, and you can buy all Life Buyables at once."],
        ["Monolith Creation", "Unlock Earth, and all Aqua Bars are twice as fast."],
        ["Tree Efficiency", "Layers only reset along their branches, rather than by row (this does NOT affect Cryo Challenges)."],
        ["Heat Automation", "After 1 second of a reset, all Flame Upgrades are automatically purchased if you can afford them."],
        ["Pressure Evolution", jsx(() => <span>Wind/Zephyr/Tornado Speeds work sublinearly (square root) rather than logarithmically, and Aqua Bars are faster based on your Earth Grid Level ({format(adv15eff.value)}x)</span>)],
        ["Particle Fusion", "Unlock Particle Combinators, gain 100% of Lightning Particle gain every second, and starting a Cryo Challenge only resets the Aqua layer."],
        ["Tropical Automation", "All Life Buyables are automatically purchased every second."],
        ["Molecular Boost", "The Spark Molecule effect is cubed."],
        ["Multitude of Thunder", "You can activate two Lightning Modes at once."],
        ["Aquatic Evolution II", "Unlock a new Aqua Bar."],
        ["Molecular Boost II", "Increase the Molecule limit by 20%."],
        ["Pressure Automation", "Gain 100% of Air Particle gain every second."],
        ["Glacial Automation", "Gain 100% of Cryo Particle gain every second."],
        ["Molecular Evolution", "Unlock Intrabonds."],
        ["Monolith Automation", "Gain 100% of Earth Particle gain every second."],
        ["Monolith Evolution", "You can fill the Earth Grid with a single button."],
        ["Glacial Evolution", "Keep Cryo Challenge completions on all resets, and increase the completion limits of the first two Cryo Challenges by 10."],
        ["Aquatic Boost", "The Wave requirement scales 50% slower."],
        ["Pressure Boost", "Multiply Zephyr & Tornado Speeds by 10."],
        ["Heat Boost", "Square the effect of the \"Liquid Fire\", \"Magma Spirit\", and \"Speed = Heat\" upgrades."],
        ["Permanent Velocity", "\"Temporary Velocity [5]\" is permanently active, and all Aqua bar requirements scale 10% slower."],
        ["Combinator Evolution", "The main Combinator effect also affects the first row of Particles."],
        ["Sensational Creation", "Unlock Light & Sound, square the Particle Combinator effect, and Lightning Modes are never de-selected by resets."],
        ["Radiant Boost", "All Light Energy colors are generated twice as fast, and you can buy max Life Buyables."],
        ["Molecular Boost III", "Increase the Molecule limit by 20%, and the Wood Molecule effect uses a better formula."],
        ["Radiant Boost II", "All Light Energy colors are generated thrice as fast, and Covalent/Ionic Bond costs scale 67% slower."],
        ["Bond Evolution", jsx(() => <span>Unlock Metallic Bonds, and all Light Energy colors are generated 20% faster for every Advancement after 35 ({format(adv37eff.value)}x)</span>)],
        ["Monolith Automation II", "Automatically level up and fill the Earth Grid if both are possible every second, and double Ultrasound gain."],
        ["Glamorous Boost", "Color Energy Boosts only use up half of your Light Particles when used, and they last 50% longer."],
        ["Molecular Boost IV", "The amount of Magma Molecules are effectively squared."],
        ["Molecular Quality", "You can max all Molecules at once."],
        ["Radiant Boost III", "All Light Energy colors are generated 4x as fast."],
        ["Glamorous Boost II", "Color Energy Boosts only use up 33% of your Light Particles when used, and they last 50% longer."],
        ["Radiant Automation", "Gain 10% of Light Particle gain every second, and you can activate all Color Energy boosts at once if you have unlocked all seven Color Energy types."],
        ["Void Creation", "Unlock Void."],
        ["Multitude of Thunder II", "You can activate three Lightning modes at once."],
        ["Radiant Evolution", "Unlock a third Red Energy Upgrade."],
        ["Void Evolution", jsx(() => <span>Unspent Dark Matter boosts Light and Sound Particle gain at a reduced rate ({format(adv48eff.value)}x)</span>)],
        ["Bond Boost", "Divide Metallic Bond & Boost costs by 10,000,000, triple Attraction Power gain, and increase the 'Temperature Decrease' completion limit by 10."],
        ["Sonic Evolution", "Unlock a new row of Sound Upgrades, and the Plastic Molecule effect also affects Metallic Bond strength."],
        ["Void Evolution II", jsx(() => <span>Each active Void-Decayed Particle type increases Particle gain by 50% ({format(adv51eff.value)}x)</span>)],
        ["Pressure Boost II", "Slightly increase the Wind/Zephyr/Tornado Speed exponent (0.5 -> 0.6)."],
        ["Void Expansion", "Unlock Lightning Void Decay."],
        ["Sonic Automation", "Gain 1% of Sound Particle gain every second, and increase Light Particle gain/s (10%/s -> 100%/s)"],
        ["Multitude of Thunder III", "You can activate all 4 Lightning modes at once, and Earth Grid Level automation is 5x faster."],
        ["Monolith Boost", jsx(() => <span>Each Earth Grid Level increases Particle gain by 2% ({format(adv56eff.value)}x)</span>)],
        ["Radiant Boost IV", jsx(() => <span>Raise the effect of the second Red Light Upgrade to an exponent starting at 2, and increasing by 0.1 for each Advancement after this (^{format(adv57eff.value)})</span>)],
        ["Glacial Reduction", "The first two Cryo Challenges have much weaker challenge effects & much smaller goals when Aqua is Void-Decayed."],
        ["Radiant Evolution II", "Unlock White Light."],
        ["Glamorous Quality", "Color Energy Boosts do not use up Light Particles when used."],
        ["Void Expansion II", "Unlock Cryo Void Decay."],
        ["Void Boost", "The first row of Void Decays increase Void Decay costs less (5x -> 2x), however their starting costs are increased by 1."],
        ["Bond Boost II", "The Plastic Molecule effect also affects Covalent Bond strength, but only at 40% efficiency."]
    ]

    const milestones = milestoneData.map((data, index) => createAdvancement(index+1, data[0], data[1]));

    return {
        id,
        name,
        color,
        advancements,
        adv5time,
        adv15eff,
        adv37eff,
        adv48eff,
        adv51eff,
        adv56eff,
        adv57eff,
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
