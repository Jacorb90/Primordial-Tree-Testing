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
import { Visibility, jsx, JSXFunction } from "features/feature";
import { createReset, GenericReset, Reset, ResetOptions } from "features/reset";
import { createResource, trackBest } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import { DecimalSource } from "lib/break_eternity";
import MainDisplay from "features/resources/MainDisplay.vue";
import lightning from "../row2/Lightning";
import advancements from "../side/Advancements";
import { render } from "util/vue";
import sound from "./Sound";

const layer = createLayer("light", () => {
    const id = "light";
    const name = "Light";
    const color = "#fff5c9";

    const light = createResource<DecimalSource>(0, "Light Particles");
    const best = trackBest(light);

    const order = createResource<number>(0);

    const conversion: Conversion<ConversionOptions> = createConversion(() => ({
        scaling: createPolynomialScaling(() => (sound.order.value == 1 ? 1 / 0 : 1e9), 1 / 3),
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
            advancements.milestones[32].earned.value && sound.order.value != 1
                ? Visibility.Visible
                : Visibility.Hidden,
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
        treeNode,
        onClick: () => {
            if (order.value == 0) {
                order.value = sound.order.value == 0 ? 1 : 2;
            }
        }
    }));

    return {
        id,
        name,
        color,
        light,
        best,
        order,
        display: jsx(() => (
            <>
                <MainDisplay resource={light} color={color} />
                {render(resetButton)}
                <br />
                <br />
            </>
        )),
        treeNode
    };
});

export default layer;
