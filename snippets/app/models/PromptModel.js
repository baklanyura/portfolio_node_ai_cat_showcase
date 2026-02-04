import {name} from "pug";

class PromptModel {
    constructor(id, name, promptText) {
        this._id = id;
        this._name = name;
        this._promptText = promptText
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get promptText() {
        return this._promptText;
    }

    set name(name) {
        this._name = name;
    }

    set promptText(promptText) {
        this._promptText = promptText;
    }

    getPromptModelData() {
        return {
            id: this._id,
            name: this._name,
            promptText: this._promptText
        }
    }

    setPromptModelData({id, name, promptText}) {
        if (id) this._id = id;
        if (name) this._name = name;
        if (promptText) this._promptText = promptText;
    }


}

export default PromptModel;