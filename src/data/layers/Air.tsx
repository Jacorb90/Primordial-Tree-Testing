/**
 * @module
 * @hidden
 */
import { createCumulativeConversion } from "features/conversion";
import { jsx, Visibility } from "features/feature";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource, format } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import advancements from "./Advancements";
import { main } from "data/projEntry";
import { computed, unref } from "vue";
import life from "./Life";
import { globalBus } from "game/events";

const layer = createLayer(() => {
    const id = "ai";
    const name = "Air";
    const color = "#ffd1fb";

    const air = createResource<DecimalSource>(0, "Air Particles");

    const wind = createResource<DecimalSource>(0, "Wind Force");
    const windMul = computed(() => {
        return Decimal.gte(air.value, 1) ? air.value : 0;
    });
    const windEff = computed(() => {
        return Decimal.add(wind.value, 1);
    });

    const zephyr = createResource<DecimalSource>(0, "Zephyr Force");
    const zephyrMul = computed(() => {
        return Decimal.gte(air.value, 3) ? Decimal.div(wind.value, 10) : 0;
    });
    const zephyrEff = computed(() => {
        return Decimal.add(zephyr.value, 1).log2();
    });

    const tornado = createResource<DecimalSource>(0, "Tornado Force");
    const tornadoMul = computed(() => {
        return Decimal.gte(air.value, 5) ? Decimal.div(zephyr.value, 10) : 0;
    });
    const tornadoEff = computed(() => {
        return Decimal.add(tornado.value, 1).log10().plus(1).log(3).plus(1).sqrt();
    });

    globalBus.on("update", diff => {
        wind.value = Decimal.mul(windMul.value, diff).plus(Decimal.pow(10, wind.value)).log10();
        zephyr.value = Decimal.mul(zephyrMul.value, diff)
            .plus(Decimal.pow(10, zephyr.value))
            .log10();
        tornado.value = Decimal.mul(tornadoMul.value, diff)
            .plus(Decimal.pow(10, tornado.value))
            .log10();
    });

    const conversion = createCumulativeConversion(() => ({
        scaling: {
            currentGain: conv => {
                if (Decimal.lt(conv.baseResource.value, 1e4)) return 0;

                if (advancements.milestones[10].earned.value)
                    return Decimal.div(conv.baseResource.value, 1e4)
                        .pow(1 / 4)
                        .times(3)
                        .sub(2)
                        .floor();
                else
                    return Decimal.div(conv.baseResource.value, 5e3)
                        .log2()
                        .root(1.4)
                        .floor()
                        .sub(conv.gainResource.value);
            },
            nextAt: conv => {
                if (advancements.milestones[10].earned.value)
                    return Decimal.div(unref(conv.currentGain), 3).plus(1).pow(4).times(1e4);
                else
                    return Decimal.pow(2, Decimal.add(conv.gainResource.value, 1).pow(1.4)).times(
                        5e3
                    );
            }
        },
        baseResource: life.life,
        gainResource: air,
        buyMax: () => advancements.milestones[10].earned.value,
        roundUpCost: true
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        visibility: () =>
            advancements.milestones[6].earned.value ? Visibility.Visible : Visibility.Hidden,
        layerID: id,
        display: jsx(() => <img src="/nodes/air.png" />),
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
        air,
        wind,
        windEff,
        zephyr,
        zephyrEff,
        tornado,
        tornadoEff,
        display: jsx(() => {
            const windEl = Decimal.gt(windMul.value, 0) ? (
                <span>
                    Wind: {format(wind.value, 2)}, Wind Speed: {format(windMul.value, 2)}x<br />
                    Multiplies Life Particle gain by {format(windEff.value, 2)}.<br />
                    <br />
                </span>
            ) : (
                ""
            );

            const zephyrEl = Decimal.gt(zephyrMul.value, 0) ? (
                <span>
                    Zephyr: {format(zephyr.value, 2)}, Zephyr Speed: {format(zephyrMul.value, 2)}x
                    <br />
                    Adds {format(zephyrEff.value, 2)} levels to all Life Buyables.
                    <br />
                    <br />
                </span>
            ) : (
                ""
            );

            const tornadoEl = Decimal.gt(tornadoMul.value, 0) ? (
                <span>
                    Tornado: {format(tornado.value, 2)}, Tornado Speed:{" "}
                    {format(tornadoMul.value, 2)}x<br />
                    Raise Base Particle gain ^{format(tornadoEff.value, 2)}
                    <br />
                    <br />
                </span>
            ) : (
                ""
            );

            return (
                <>
                    <MainDisplay resource={air} color={color} />
                    {render(resetButton)}
                    <br />
                    <br />
                    {windEl}
                    <br />
                    {zephyrEl}
                    <br />
                    {tornadoEl}
                    <br />
                </>
            );
        }),
        treeNode
    };
});

export default layer;
