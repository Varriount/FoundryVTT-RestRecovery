import CustomSvelteApplication from "../custom-svelte-application.js";
import LongRestShell from './long-rest-shell.svelte';

export default class LongRestDialog extends CustomSvelteApplication {

    constructor(actor, options = {}, dialogData = {}) {
        super({
            title: `${game.i18n.localize("DND5E.LongRest")}: ${actor.name}`,
            zIndex: 102,
            svelte: {
                class: LongRestShell,
                target: document.body,
                props: {
                    actor
                }
            },
            close: () => this.options.reject(),
            ...options
        }, dialogData);
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            closeOnSubmit: false,
            width: 400,
            height: "auto",
            classes: ["dnd5e dialog"]
        })
    }

}