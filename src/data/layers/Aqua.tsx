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
import lightning from "./Lightning";

const layer = createLayer(() => {
    const id = "a";
    const name = "Aqua";
    const color = "#2197eb";

    const aqua = createResource<DecimalSource>(0, "Aqua Particles");
    const best = trackBest(aqua);

    const bubbleTime = createResource<DecimalSource>(0);
    const bubbles = computed(() => {
        return Decimal.log10(Decimal.add(bubbleTime.value, 1));
    });
    const bubbleSpeed = computed(() => {
        let speed = new Decimal(1);

        if (flame.upgrades[2].bought.value) speed = speed.times(flame.upgradeEffects[2].value);

        return speed;
    });

    const waveTime = createResource<DecimalSource>(0);
    const waves = computed(() => {
        return Decimal.log10(Decimal.add(waveTime.value, 1));
    });

    globalBus.on("update", diff => {
        bubbleTime.value = Decimal.add(
            bubbleTime.value,
            Decimal.mul(aqua.value, diff).times(bubbleSpeed.value)
        );
        waveTime.value = Decimal.add(
            waveTime.value,
            Decimal.mul(Decimal.floor(bubbles.value), diff / 10)
        );
    });

    const baseAquaParticleReq = computed(() => {
        let req = new Decimal(10);

        req = req.div(Decimal.pow(2, Decimal.floor(waves.value)));

        return req;
    });

    const gainMult = computed(() => {
        let mult = Decimal.dOne;

        if (lightning.lightningSel.value == 2)
            mult = mult.times(lightning.clickableEffects.value[2]);

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
