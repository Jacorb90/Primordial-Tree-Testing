/**
 * @module
 * @hidden
 */

import { createLayerTreeNode, createResetButton } from "data/common";
import { main } from "data/projEntry";
import { createConversion, createPolynomialScaling } from "features/conversion";
import { Visibility, jsx } from "features/feature";
import { createReset } from "features/reset";
import { createResource, trackBest } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import { DecimalSource } from "lib/break_eternity";
import MainDisplay from "features/resources/MainDisplay.vue";
import air from "../row2/Air";
import advancements from "../side/Advancements";
import { render } from "util/vue";
import light from "./Light";
import { globalBus } from "game/events";

const layer = createLayer("sound", () => {
    const id = "sound";
    const name = "Sound";
    const color = "#ddcfff";

    const sound = createResource<DecimalSource>(0, "Sound Particles");
    const best = trackBest(sound);

    const order = createResource<number>(0);

    const conversion = createConversion(() => ({
        scaling: createPolynomialScaling(() => (light.order.value == 1 ? 1 / 0 : 1e7), 1 / 3),
        baseResource: air.air,
        gainResource: sound
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

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode,
        onClick: () => {
            if (order.value == 0) {
                order.value = light.order.value == 0 ? 1 : 2;
            }
        }
    }));

    return {
        id,
        name,
        color,
        sound,
        best,
        order,
        display: jsx(() => (
            <>
                <MainDisplay resource={sound} color={color} />
                {render(resetButton)}
                <br />
                <br />
            </>
        )),
        treeNode
    };
});

export default layer;
