/**
 * @module
 * @hidden
 */
import { createCumulativeConversion, createPolynomialScaling } from "features/conversion";
import { CoercableComponent, jsx, Visibility } from "features/feature";
import { createReset, Reset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, Resource, trackBest } from "features/resources/resource";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource, format, formatWhole } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../../common";
import advancements from "../side/Advancements";
import { main } from "data/projEntry";
import { Challenge, createChallenge } from "features/challenges/challenge";
import { Computable } from "util/computed";
import { computed, Ref, unref } from "vue";
import flame from "../row1/Flame";
import life from "../row1/Life";
import aqua from "../row1/Aqua";
import { addTooltip } from "features/tooltips/tooltip";
import { Direction } from "util/common";
import { createResourceTooltip } from "features/trees/tree";
import combinators from "../row4/Combinators";
import {
    createSequentialModifier,
    createMultiplicativeModifier,
    createModifierSection,
Modifier
} from "game/modifiers";
import { globalBus } from "game/events";
import voidLayer from "../side/Void";
import { createExponentialModifier } from "game/modifiers";

const layer = createLayer("c", () => {
    const id = "c";
    const name = "Cryo";
    const color = "#03f4fc";

    const voidDecayed = computed(() => voidLayer.voidDecays.cryo.bought.value);

    const cryo = createResource<DecimalSource>(0, "Cryo Particles");
    const best = trackBest(cryo);

    const baseReq = computed(() => {
        let req: DecimalSource = aqua.voidDecayed.value ? 0.1 : 1e3;

        if (voidDecayed.value) req = aqua.voidDecayed.value ? 1e5 : "1e45";

        return req;
    });

    const conversion = createCumulativeConversion(() => ({
        scaling: createPolynomialScaling(baseReq, computed(() => aqua.voidDecayed.value ? 15 / 4 : 3 / 4)),
        baseResource: aqua.aqua,
        gainResource: cryo,
        roundUpCost: true,
        gainModifier: createSequentialModifier<Modifier[], Required<Modifier>>(
            createMultiplicativeModifier(
                combinators.mainEff,
                "Particle Combinator Effect",
                advancements.milestones[15].earned
            ),
            createMultiplicativeModifier(
                1e10,
                "Void-Decayed Aqua",
                aqua.voidDecayed
            ),
            createExponentialModifier(
                1 / 7,
                "Void Decay",
                voidDecayed
            )
        )
    }));

    globalBus.on("update", diff => {
        if (advancements.milestones[22].earned.value) {
            cryo.value = Decimal.mul(conversion.currentGain.value, diff).plus(cryo.value);
        }
    });

    const challenge1Data = {
        lifeBuyableCosts: computed(() =>
            Decimal.div(challenges[0].completions.value, (advancements.milestones[57].earned.value && aqua.voidDecayed.value) ? 16 : 4).plus(1.25)
        ),
        aquaParticleCost: computed(() => Decimal.div(challenges[0].completions.value, (advancements.milestones[57].earned.value && aqua.voidDecayed.value) ? 40 : 5).plus(1.2)),
        reward: computed(() => {
            let comps = challenges[0].completions.value;
            if (Decimal.gte(comps, 11)) comps = Decimal.pow(comps, 2).div(11).plus(5);

            let reward = Decimal.add(cryo.value, 1)
                .pow(voidDecayed.value ? 2 : 0.5)
                .times(comps)
                .times(Decimal.pow(1.1, comps))
                .plus(1);

            const scs = Decimal.add(voidDecayed.value ? 1e3 : 20, comps);
            if (reward.gte(scs)) reward = reward.log(scs.sqrt()).pow(2).times(scs).div(4);

            if (Decimal.gte(combinators.best.value, 6))
                reward = reward.pow(combinators.multiBuyableEffects[6].value);

            return reward;
        })
    };

    const challenge2Data = {
        aquaBarDiv: computed(() => Decimal.pow(1.5, challenges[1].completions.value).times((advancements.milestones[57].earned.value && aqua.voidDecayed.value) ? 2.5 : 10)),
        reward: computed(() => {
            let comps = challenges[1].completions.value;
            if (Decimal.gte(comps, 11)) comps = Decimal.pow(comps, 2).div(11).plus(5);

            let eff = Decimal.mul(cryo.value, comps)
                .plus(1)
                .log(voidDecayed.value ? 2 : 10)
                .times(Decimal.gte(comps, 11) ? Decimal.sub(comps, 9).log10().plus(1).cbrt() : 1)
                .plus(1);
            
            if (voidDecayed.value) eff = eff.times(5);

            if (Decimal.gte(combinators.best.value, 3))
                eff = eff.pow(combinators.multiBuyableEffects[3].value);

            return eff;
        })
    };

    const challenge3Data = {
        exp: computed(() => Decimal.div(challenges[2].completions.value, 2).plus(2)),
        reward: computed(() => {
            let comps = challenges[2].completions.value;
            if (Decimal.gte(comps, 11)) comps = Decimal.pow(comps, 2).div(11).plus(5);

            return Decimal.sqrt(comps).div(voidDecayed.value ? 8 : 10).plus(1);
        })
    };

    const challenges: Challenge<{
        visibility: () => Visibility.Visible | Visibility.None;
        reset: Reset<{ thingsToReset: () => Record<string, unknown>[] }>;
        completionLimit: Ref<number>;
        resource: Resource<DecimalSource>;
        goal: Computable<Decimal>;
        display: Computable<
            | CoercableComponent
            | {
                  title: CoercableComponent;
                  description: CoercableComponent;
                  goal: CoercableComponent;
                  reward: CoercableComponent;
                  effectDisplay?: CoercableComponent;
              }
        >;
    }>[] = [
        createChallenge(() => ({
            visibility: () =>
                Decimal.gte(best.value, 1) || advancements.milestones[26].earned.value
                    ? Visibility.Visible
                    : Visibility.None,
            reset: challengeReset,
            completionLimit: computed(() => (advancements.milestones[26].earned.value ? 20 : 10) + (advancements.milestones[48].earned.value ? 10 : 0)),
            resource: aqua.aqua,
            goal: () => {
                let comps: DecimalSource = challenges[0].completions.value;
                if (Decimal.gte(comps, 20)) comps = Decimal.pow(comps, 2).div(20).plus(5);
                if (Decimal.gte(comps, 10)) comps = Decimal.pow(comps, 2).div(10).plus(5);
                return Decimal.pow(2, comps).times(100).root((advancements.milestones[57].earned.value && aqua.voidDecayed.value) ? 7 : 1);
            },
            display: () => ({
                title:
                    "Temperature Decrease (" +
                    formatWhole(challenges[0].completions.value) +
                    "/" +
                    formatWhole(challenges[0].completionLimit.value) +
                    ")",
                description:
                    "Disable the Flame layer" +
                    ", Life buyable costs are raised ^" +
                    format(challenge1Data.lifeBuyableCosts.value, 2) +
                    ", and Aqua Particle base cost is raised ^" +
                    format(challenge1Data.aquaParticleCost.value, 2) +
                    " and cannot get below 1",
                goal: formatWhole(unref(challenges[0].goal)) + " Aqua Particles",
                reward: "All Aqua bars are faster based on Cryo Particles.",
                effectDisplay: format(challenge1Data.reward.value, 2) + "x"
            })
        })),
        createChallenge(() => ({
            visibility: () =>
                Decimal.gte(challenges[0].completions.value, 1)
                    ? Visibility.Visible
                    : Visibility.None,
            reset: challengeReset,
            completionLimit: computed(() => (advancements.milestones[26].earned.value ? 20 : 10)),
            resource: aqua.aqua,
            goal: () => {
                let comps: DecimalSource = challenges[1].completions.value;
                if (Decimal.gte(comps, 10)) comps = Decimal.pow(comps, 2).div(10).plus(5);
                return Decimal.pow(2.5, comps).times(150).root((advancements.milestones[57].earned.value && aqua.voidDecayed.value) ? 7 : 1);
            },
            display: () => ({
                title:
                    "Full Freeze (" +
                    formatWhole(challenges[1].completions.value) +
                    "/" +
                    formatWhole(challenges[1].completionLimit.value) +
                    ")",
                description:
                    "Disable the Life layer" +
                    ", and Aqua bars are " +
                    format(challenge2Data.aquaBarDiv.value, 2) +
                    "x slower",
                goal: formatWhole(unref(challenges[1].goal)) + " Aqua Particles",
                reward: "All Life Buyables are cheaper based on Cryo Particles.",
                effectDisplay: "/" + format(challenge2Data.reward.value, 2)
            })
        })),
        createChallenge(() => ({
            visibility: () =>
                Decimal.gte(challenges[1].completions.value, 1)
                    ? Visibility.Visible
                    : Visibility.None,
            reset: challengeReset,
            completionLimit: computed(() => 10), // will be more useful later lol
            resource: main.particles,
            goal: () => {
                let comps: DecimalSource = challenges[2].completions.value;
                if (Decimal.gte(comps, 10)) comps = Decimal.pow(comps, 2).div(10).plus(5);
                return Decimal.pow(10, Decimal.pow(comps, 1.5)).times(1e4);
            },
            display: () => ({
                title:
                    "Absolute Zero (" +
                    formatWhole(challenges[2].completions.value) +
                    "/" +
                    formatWhole(challenges[2].completionLimit.value) +
                    ")",
                description:
                    "Disable the Aqua layer" +
                    ", and Fire Upgrade and Life Buyable costs are raised ^" +
                    format(challenge3Data.exp.value, 2),
                goal: formatWhole(unref(challenges[2].goal)) + " Particles",
                reward: "Empower the first Flame upgrade.",
                effectDisplay: "^" + format(challenge3Data.reward.value, 2)
            })
        }))
    ];

    const challengeReset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] =>
            advancements.milestones[15].earned.value ? [aqua] : [flame, life, aqua],
        onReset() {
            main.particles.value = 10;
            main.best.value = main.particles.value;
            main.total.value = main.particles.value;
        }
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => {
            const ret = {
                cryo,
                best,
                treeNode
            };

            if (advancements.milestones[26].earned.value) {
                return [{ ...ret, challenge1Data, challenge2Data, challenge3Data }];
            } else {
                return [
                    {
                        ...ret,
                        challenges,
                        challenge1Data,
                        challenge2Data,
                        challenge3Data
                    }
                ];
            }
        }
    }));

    const treeNode = createLayerTreeNode(() => ({
        visibility: () =>
            advancements.milestones[2].earned.value ? Visibility.Visible : Visibility.Hidden,
        layerID: id,
        display: jsx(() => <img src={"./nodes/"+(voidDecayed.value ? "void_" : "")+"cryo.png"} />),
        color,
        reset,
        glowColor: () => (challenges.some(c => c.canComplete.value) ? "red" : "")
    }));
    addTooltip(treeNode, {
        display: createResourceTooltip(cryo),
        pinnable: true,
        style: () => (treeNode.visibility.value === Visibility.Visible ? "" : "display: none")
    });

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));
    addTooltip(resetButton, {
        display: jsx(() =>
            createModifierSection(
                "Modifiers",
                "",
                conversion.gainModifier!,
                conversion.scaling.currentGain(conversion)
            )
        ),
        pinnable: true,
        direction: Direction.Down,
        style: "width: 400px; text-align: left"
    });

    return {
        id,
        name,
        color,
        cryo,
        best,
        voidDecayed,
        display: jsx(() => (
            <>
                <MainDisplay resource={cryo} color={color} />
                {render(resetButton)}
                <br />
                <br />
                <table>
                    <tbody>
                        {challenges.map(ch => (
                            <tr>
                                <td>{render(ch)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        )),
        treeNode,
        challenges,
        challenge1Data,
        challenge2Data,
        challenge3Data
    };
});

export default layer;
