/**
 * @module
 * @hidden
 */
import { computed, Ref } from "@vue/reactivity";
import { createLayerTreeNode } from "data/common";
import { CoercableComponent, jsx, showIf, Visibility } from "features/feature";
import { createInfobox, Infobox, InfoboxOptions } from "features/infoboxes/infobox";
import { createResource } from "features/resources/resource";
import { createLayer } from "game/layers";
import Decimal from "util/bignum";
import { renderJSX } from "util/vue";
import advancements from "./Advancements";

const layer = createLayer("lore", () => {
    const id = "lore";
    const name = "Lore";
    const color = "#f4d4ff";

    const loreData: Infobox<InfoboxOptions>[] = [
        createInfobox(
            () => ({
                visibility: Visibility.Visible,
                color: "#000000",
                title: "The Beginning",
                display: jsx(() => (
                    <>
                        So... you're telling me that I can make my own universe? Sweet!
                        <br />
                        No, I'm not going to back down just because I'm younger than you, let me
                        have this.
                        <br />
                        Great! So, I can just take these tools and get started then?
                        <br />
                        Alright, here goes!
                        <br />
                    </>
                )),
                titleStyle: {
                    color: "white"
                }
            }),
            true
        ),

        createInfobox(
            () =>
                ({
                    visibility: computed(() => showIf(advancements.milestones[0].earned.value)),
                    color: "#ffd500",
                    title: "A New Particle",
                    display: jsx(() => (
                        <>
                            Ooh I have news for you! I found a new primordial particle!
                            <br />
                            Oh... you've already heard of this one? I thought I made some kind of
                            discovery...
                            <br />
                            Yes, I did expect a universe to be normally made of only three particle
                            types, thank you.
                            <br />
                            Ugh I guess I'll just keep building this thing then, maybe you could
                            tell me things like this a little sooner next time?
                            <br />
                        </>
                    )),
                    style: {
                        color: "black"
                    }
                } as InfoboxOptions),
            true
        ),

        createInfobox(
            () =>
                ({
                    visibility: computed(() => showIf(advancements.milestones[2].earned.value)),
                    color: "#03f4fc",
                    title: "Frozen Solid",
                    display: jsx(() => (
                        <>
                            Oh let me guess, this one was already discovered too, right?
                            <br />
                            See, I knew it. Damn discovering new things is harder than I thought.
                            <br />
                            I guess particles that make things cold aren't really all that
                            interesting, and are probably completely useless, but hey why not put
                            them in too, right?
                            <br />
                            Time to keep making this boring universe...
                            <br />
                        </>
                    )),
                    style: {
                        color: "black"
                    }
                } as InfoboxOptions),
            true
        ),

        createInfobox(
            () =>
                ({
                    visibility: computed(() => showIf(advancements.milestones[3].earned.value)),
                    color: "#ffffff",
                    title: "Self Sustaining",
                    display: jsx(() => (
                        <>
                            Ah, my universe has finally reached the point where it can generate its
                            own particles! This has gotta be revolutionary, right?
                            <br />
                            No? You're saying that self-sustaining universes already exist? Ughhhh
                            what does it take to make something new?
                            <br />
                            Nah, I'll be able to make something unique, you may think it's all been
                            done before but I'm sure I'll stumble upon something unique soon.
                            <br />
                            You don't have to believe in me, just let me prove you wrong.
                            <br />
                        </>
                    )),
                    style: {
                        color: "black"
                    }
                } as InfoboxOptions),
            true
        )
    ];

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        display: "L",
        color
    }));

    return {
        id,
        name,
        color,
        loreData,
        treeNode,
        display: jsx(() => (
            <>
                <table>
                    <tbody>
                        {loreData.map(infobox => (
                            <>
                                {renderJSX(infobox)}
                                <div style="margin-top: 0.5em;"></div>
                            </>
                        ))}
                    </tbody>
                </table>
            </>
        ))
    };
});

export default layer;
