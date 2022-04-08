import Spacer from "components/layout/Spacer.vue";
import { jsx } from "features/feature";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import { defaultResetPropagation, createTree, GenericTree } from "features/trees/tree";
import { globalBus } from "game/events";
import { createLayer, GenericLayer } from "game/layers";
import player, { PlayerData } from "game/player";
import Decimal, { DecimalSource, format, formatWhole, formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed, toRaw } from "vue";
import flame from "./layers/Flame";
import life from "./layers/Life";
import aqua from "./layers/Aqua";
import advancements from "./layers/Advancements";
import lightning from "./layers/Lightning";

/**
 * @hidden
 */
export const main = createLayer(() => {
    const particles = createResource<DecimalSource>(10, "particles");
    const best = trackBest(particles);
    const total = trackTotal(particles);

    const baseGain = computed(() => {
        let gain = new Decimal(0);

        if (flame.upgrades[0].bought.value) gain = gain.plus(flame.upgradeEffects[0].value);
        gain = gain.plus(life.buyables[0].amount.value);
        gain = gain.plus(Decimal.floor(aqua.bubbles.value));
        if (lightning.lightningSel.value == 0)
            gain = gain.plus(lightning.clickableEffects.value[0]);

        return gain;
    });

    const particleGain = computed(() => {
        let gain = baseGain.value;

        if (flame.upgrades[1].bought.value) gain = gain.times(flame.upgradeEffects[1].value);
        gain = gain.times(life.buyableEffects.value[1]);
        if (lightning.lightningSel.value == 1)
            gain = gain.times(lightning.clickableEffects.value[1]);

        return gain;
    });

    globalBus.on("update", diff => {
        particles.value = Decimal.add(particles.value, Decimal.times(particleGain.value, diff));
    });
    const oomps = trackOOMPS(particles, particleGain);

    const row1 = [flame.treeNode, life.treeNode, aqua.treeNode];
    const tree = createTree(() => ({
        nodes: [row1, [lightning.treeNode]],
        leftSideNodes: [advancements.treeNode],
        branches: [],
        onReset() {
            particles.value = row1.some(tn => toRaw(this.resettingNode.value) === toRaw(tn))
                ? 0
                : 10;
            best.value = particles.value;
            total.value = particles.value;
        },
        resetPropagation: defaultResetPropagation
    })) as GenericTree;

    return {
        id: "main",
        name: "Tree",
        links: tree.links,
        display: jsx(() => (
            <>
                <div v-show={player.devSpeed === 0}>Game Paused</div>
                <div v-show={player.devSpeed && player.devSpeed !== 1}>
                    Dev Speed: {format(player.devSpeed || 0)}x
                </div>
                <div v-show={player.offlineTime != undefined}>
                    Offline Time: {formatTime(player.offlineTime || 0)}
                </div>
                <div>
                    <span v-show={Decimal.lt(particles.value, "1e1000")}>You have </span>
                    <h2>{formatWhole(particles.value)}</h2>
                    <span v-show={Decimal.lt(particles.value, "1e1e6")}> particles</span>
                </div>
                <div v-show={Decimal.gt(particleGain.value, 0)}>({oomps.value})</div>
                <Spacer />
                {render(tree)}
            </>
        )),
        particles,
        particleGain,
        best,
        total,
        oomps,
        tree
    };
});

export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<PlayerData>
): Array<GenericLayer> => [main, flame, life, aqua, advancements, lightning];

export const hasWon = computed(() => {
    return false;
});

/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<PlayerData>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
