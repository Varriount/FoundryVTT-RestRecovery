import * as lib from "./lib/lib.js";
import CONSTANTS from "./constants.js";

export default class API {

    /**
     * Returns an array containing all the module profile names
     *
     * @returns {string[]}
     */
    static getAllProfiles(){
        return Object.keys(this.getAllProfilesData());
    }

    /**
     * Returns the module profile object with each ones' settings
     *
     * @returns {object}
     */
    static getAllProfilesData(){
        return lib.getSetting(CONSTANTS.SETTINGS.MODULE_PROFILES);
    }

    /**
     * Returns a given module profile's data if it exists
     *
     * @param {string} inProfileName
     * @returns {object}
     */
    static getProfileData(inProfileName){
        const profile = this.getAllProfilesData()[inProfileName];
        if(!profile){
            ui.notifications.error(`Rest Recovery | Profile "${inProfileName}" does not exist`);
            throw new Error(`Rest Recovery | Profile "${inProfileName}" does not exist`);
        }
        return profile;
    }

    /**
     * Returns the name of the active module profile
     *
     * @returns {string}
     */
    static getActiveProfile(){
        return lib.getSetting(CONSTANTS.SETTINGS.ACTIVE_MODULE_PROFILE)
    }

    /**
     * Returns the data for the active module profile
     *
     * @returns {object}
     */
    static getActiveProfileData(){
        return this.getProfileData(this.getActiveProfile());
    }

    /**
     * Sets the current active module profile
     *
     * @param {string} inProfileName
     * @returns {Promise<object>}
     */
    static async setActiveProfile(inProfileName){
        await lib.setSetting(CONSTANTS.SETTINGS.ACTIVE_MODULE_PROFILE, inProfileName);
        const profile = this.getProfileData(inProfileName);
        const defaultSettings = CONSTANTS.GET_DEFAULT_SETTINGS();
        for(let key of Object.keys(defaultSettings)) {
            const value = profile[key] ?? defaultSettings[key].default;
            await lib.setSetting(key, value);
        }
        return profile;
    }

    /**
     * Updates all module profiles with new settings.  This may be a partial update (such as only updating some keys of some profiles).
     *
     * @param {object} inProfiles
     * @returns {Promise<*>}
     */
    static updateProfiles(inProfiles){
        const defaultSettings = CONSTANTS.GET_DEFAULT_SETTINGS();
        for(let profileName of Object.keys(inProfiles)) {
            const profileData = {};
            const originalProfileData = this.getProfileData(profileName);
            for (let key of Object.keys(defaultSettings)) {
                profileData[key] = inProfiles[profileName][key] ?? originalProfileData[key] ?? defaultSettings[key].default;
            }
            inProfiles[profileName] = profileData;
        }
        return lib.setSetting(CONSTANTS.SETTINGS.MODULE_PROFILES, inProfiles);
    }

    /**
     * Applies new settings on a given module profile. This may be a partial update (such as only updating one key of a given profile).
     *
     * @param {string} inProfileName
     * @param {object} inData
     * @returns {Promise<*>}
     */
    static updateProfile(inProfileName, inData){
        const profile = this.getProfileData(inProfileName);
        const profiles = this.getAllProfilesData();
        const newData = {};
        const defaultSettings = CONSTANTS.GET_DEFAULT_SETTINGS();
        for (let key of Object.keys(defaultSettings)) {
            newData[key] = inData[key] ?? profile[key] ?? defaultSettings[key].default;
        }
        profiles[inProfileName] = newData;
        return lib.setSetting(CONSTANTS.SETTINGS.MODULE_PROFILES, profiles);
    }

    /**
     * Sets the food, water, and/or starvation levels of a given actor.
     *
     * @param {Actor} actor
     * @param {number|null} [food] food
     * @param {number|null} [water] water
     * @param {number|null} [starvation] starvation
     * @returns {Promise<boolean>}
     */
    static setActorConsumableValues(actor, { food = null, water = null, starvation} = {}){
        if(!(actor instanceof game.dnd5e.entities.Actor5e)){
            throw new Error("actor must instance of Actor5e")
        }
        const update = {};
        if(food !== null){
            if(!(lib.isRealNumber(food) && food >= 0)) throw new Error("food must be of type number greater or equal than 0")
            update[CONSTANTS.FLAGS.SATED_FOOD] = food;
        }
        if(water !== null){
            if(!(lib.isRealNumber(water) && water >= 0)) throw new Error("water must be of type number greater or equal than 0")
            update[CONSTANTS.FLAGS.SATED_WATER] = water;
        }
        if(starvation !== null){
            if(!(lib.isRealNumber(starvation) && starvation >= 0)) throw new Error("starvation must be of type number greater or equal than 0")
            update[CONSTANTS.FLAGS.STARVATION] = starvation;
        }
        return actor.update(update);
    }

}