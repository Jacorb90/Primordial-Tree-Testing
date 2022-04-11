/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion, createPolynomialScaling } from "features/conversion";
import { jsx } from "features/feature";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, trackBest } from "features/resources/resource";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createBar, Direction } from "features/bars/bar";
import { formatWhole } from "util/break_eternity";
import { computed } from "vue";
import { globalBus } from "game/events";
import flame from "./Flame";
import life from "./Life";
import advancements from "./Advancements";
import lightning from "./Lightning";
import cryo from "./Cryo";

const layer = createLayer(() => {
    const id = "a";
    const name = "Aqua";
    const color = "#2197eb";

    const aqua = createResource<DecimalSource>(0, "Aqua Particles");
    const best = trackBest(aqua);

    const time = createResource<number>(0);

    const bubbleTime = createResource<DecimalSource>(0);
    const bubbles = computed(() => {
        return Decimal.log10(Decimal.add(bubbleTime.value, 1));
    });
    const bubbleSpeed = computed(() => {
        let speed = new Decimal(1);

        if (flame.upgradesR1[2].bought.value) speed = speed.times(flame.upgradeEffects[2].value);
        speed = speed.times(life.buyableEffects[4].value);

        return speed;
    });

    const waveTime = createResource<DecimalSource>(0);
    const waves = computed(() => {
        return Decimal.log10(Decimal.add(waveTime.value, 1));
    });

    globalBus.on("update", diff => {
        bubbleTime.value = Decimal.add(
            bubbleTime.value,
            Decimal.mul(aqua.value, diff).times(bubbleSpeed.value).times(aquaBarSpeed.value)
        );
        waveTime.value = Decimal.add(
            waveTime.value,
            Decimal.mul(Decimal.floor(bubbles.value), diff / 10).times(aquaBarSpeed.value)
        );

        if (advancements.milestones[3].earned.value)
            aqua.value = Decimal.mul(conversion.currentGain.value, diff).plus(aqua.value);

        time.value += diff;
    });

    const baseAquaParticleReq = computed(() => {
        if (cryo.challenges[2].active.value) return new Decimal(1 / 0);

        let req = new Decimal(10);

        req = req.div(Decimal.pow(2, Decimal.floor(waves.value)));

        if (cryo.challenges[0].active.value)
            req = req.pow(cryo.challenge1Data.aquaParticleCost.value);

        return req;
    });

    const gainMult = computed(() => {
        let mult = Decimal.dOne;

        if (lightning.lightningSel.value == 2)
            mult = mult.times(lightning.clickableEffects[2].value);
        if (advancements.milestones[4].earned.value && time.value <= 120) mult = mult.times(3);

        return mult;
    });

    const conversion = createCumulativeConversion(() => ({
        scaling: createPolynomialScaling(baseAquaParticleReq, 1 / 3),
        baseResource: main.particles,
        gainResource: aqua,
        roundUpCost: true,
        gainModifier: {
            apply: gain => Decimal.mul(gain, gainMult.value),
            revert: gain => Decimal.div(gain, gainMult.value)
        }
    }));

    const aquaBarSpeed = computed(() => {
        let speed = Decimal.dOne;

        speed = speed.times(cryo.challenge1Data.reward.value);

        if (cryo.challenges[1].active.value)
            speed = speed.div(cryo.challenge2Data.aquaBarDiv.value);

        return speed;
    });

    const bubbleBar = createBar(() => ({
        width: 300,
        height: 25,
        direction: Direction.Right,
        progress: () => Decimal.sub(bubbles.value, Decimal.floor(bubbles.value))
    }));
    const waveBar = createBar(() => ({
        width: 300,
        height: 25,
        direction: Direction.Right,
        progress: () => Decimal.sub(waves.value, Decimal.floor(waves.value))
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        display: jsx(() => <img src="/nodes/aqua.png" />),
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
        aqua,
        time,
        bubbleTime,
        bubbles,
        waveTime,
        waves,
        display: jsx(() => {
            const bubbleDiv = Decimal.gt(best.value, 0) ? (
                <>
                    {formatWhole(Decimal.floor(bubbles.value))} Bubbles, each generating 1
                    Particle/second
                    <br />
                    {render(bubbleBar)}
                </>
            ) : (
                <div />
            );

            const waveDiv = Decimal.gte(bubbles.value, 1) ? (
                <>
                    {formatWhole(Decimal.floor(waves.value))} Waves, each halving the Aqua Particle
                    cost
                    <br />
                    {render(waveBar)}
                </>
            ) : (
                <div />
            );

            return (
                <>
                    <MainDisplay resource={aqua} color={color} />
                    {render(resetButton)}
                    <br />
                    <br />
                    {bubbleDiv}
                    <br />
                    {waveDiv}
                </>
            );
        }),
        treeNode
    };
});

export default layer;
