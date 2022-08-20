/**
 * @module
 * @hidden
 */

import { computed } from "@vue/reactivity";
import { main } from "data/projEntry";
import { jsx, showIf } from "features/feature";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { createLayerTreeNode } from "../../common";
import { createLayer } from "game/layers";
import Decimal from "lib/break_eternity";
import { DecimalSource, formatWhole } from "util/bignum";
import advancements from "./Advancements";

const layer = createLayer("v", () => {
    const id = "v";
    const name = "Void";
    const color = "#240040";

    const darkMatter = computed(() => {
        const particles = main.best.value;
        return Decimal.div(particles, 5e46).root(10);
    });

    const voidDecays = createResource<DecimalSource>(0, "Void Decays");

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        display: jsx(() => <div style="margin-left: .6em">V</div>),
        visibility: () => showIf(advancements.milestones[44].earned.value),
        color,
        reset
    }));

    return {
        id,
        name,
        color,
        darkMatter,
        voidDecays,
        treeNode,
        display: jsx(() => (
            <>
                <MainDisplay resource={voidDecays} color={color} /><br/><br/>
                There is <span style={"color: " + color+"; font-size: 40px; font-weight: bold;"}>{formatWhole(darkMatter.value)}</span> Dark Matter.<br/><br/>

                To be implemented ;)
            </>
        ))
    }
})

export default layer;