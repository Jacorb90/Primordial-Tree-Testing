import { ScalingFunction } from "features/conversion";
import { GenericTree, GenericTreeNode } from "features/trees/tree";
import Decimal, { DecimalSource } from "util/bignum";
import { Ref, unref } from "vue";

export function createExponentialScaling(
    factor: DecimalSource | Ref<DecimalSource>,
    base: DecimalSource | Ref<DecimalSource>,
    exponent: DecimalSource | Ref<DecimalSource>
): ScalingFunction {
    return {
        currentGain(conversion) {
            const gain = Decimal.div(conversion.baseResource.value, unref(factor))
                .log(unref(base))
                .root(unref(exponent));

            if (gain.isNan()) {
                return new Decimal(0);
            }
            return gain;
        },
        currentAt(conversion) {
            let current: DecimalSource = unref(conversion.currentGain);
            if (conversion.gainModifier) {
                current = conversion.gainModifier.revert(current);
            }
            current = Decimal.max(0, current);
            return Decimal.pow(unref(base), Decimal.pow(current, unref(exponent))).times(
                unref(factor)
            );
        },
        nextAt(conversion) {
            let next: DecimalSource = Decimal.add(unref(conversion.currentGain), 1);
            if (conversion.gainModifier) {
                next = conversion.gainModifier.revert(next);
            }
            next = Decimal.max(0, next);
            return Decimal.pow(unref(base), Decimal.pow(next, unref(exponent)))
                .times(unref(factor))
                .max(unref(base));
        }
    };
}

export const oneWayBranchedResetPropagation = function (
    tree: GenericTree,
    resettingNode: GenericTreeNode
): void {
    const visitedNodes = [resettingNode];
    let currentNodes = [resettingNode];
    if (tree.branches != null) {
        const branches = unref(tree.branches);
        while (currentNodes.length > 0) {
            const nextNodes: GenericTreeNode[] = [];
            currentNodes.forEach(node => {
                branches
                    .filter(branch => branch.startNode === node)
                    .map(branch => branch.endNode)
                    .filter(node => !visitedNodes.includes(node))
                    .forEach(node => {
                        // Check here instead of in the filter because this check's results may
                        // change as we go through each node
                        if (!nextNodes.includes(node)) {
                            nextNodes.push(node);
                            node.reset?.reset();
                        }
                    });
            });
            currentNodes = nextNodes;
            visitedNodes.push(...currentNodes);
        }
    }
};
