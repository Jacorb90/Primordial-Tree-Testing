/**
 * @module
 * @hidden
 */
import { createLayerTreeNode, createResetButton } from "data/common";
import { createExponentialScaling } from "data/helpers";
import { main } from "data/projEntry";
import { createIndependentConversion } from "features/conversion";
import { Visibility, jsx } from "features/feature";
import { createReset } from "features/reset";
import { createResource } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import Decimal, { DecimalSource } from "lib/break_eternity";
import { render } from "util/vue";
import advancements from "../Advancements";
import MainDisplay from "features/resources/MainDisplay.vue";
import { computed } from "vue";
import { format } from "util/bignum";

type Res = "Flame" | "Life" | "Aqua" | "Lightning" | "Cryo" | "Air" | "Earth";

type ResWithCost = {
    res: Res;
    cost: DecimalSource;
};

type Combination = {
    name: string;
    costData: ResWithCost[];
};

const COMBINATIONS: Combination[] = [
    {
        name: "Small Fire",
        costData: [
            {
                res: "Flame",
                cost: 1e6
            }
        ]
    }
];

const layer = createLayer("comb", () => {
    const id = "comb";
    const name = "Combinators";
    const color = "#03fca9";

    const combinators = createResource<DecimalSource>(0, "Particle Combinators");

    const mainEff = computed(() => {
        return Decimal.sqrt(combinators.value).plus(1);
    });

    const conversion = createIndependentConversion(() => ({
        scaling: createExponentialScaling(1e11, 4, 2),
        baseResource: main.particles,
        gainResource: combinators,
        roundUpCost: true
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        visibility: () =>
            advancements.milestones[15].earned.value ? Visibility.Visible : Visibility.Hidden,
        layerID: id,
        display: jsx(() => <img src="./nodes/combinators.png" />),
        color,
        reset,
        style: {
            transform: "scale(1.5)"
        }
    }));
    addTooltip(treeNode, {
        display: createResourceTooltip(combinators),
        pinnable: true,
        style: () => (treeNode.visibility.value === Visibility.Visible ? "" : "display: none")
    });

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));

    return {
        id,
        name,
        color,
        combinators,
        mainEff,
        display: jsx(() => (
            <>
                <MainDisplay resource={combinators} color={color} />
                {render(resetButton)} <br />
                <br />
                Multiplies Earth, Lightning, Air, and Cryo Particles by {format(mainEff.value)}.
            </>
        )),
        treeNode
    };
});

export default layer;
