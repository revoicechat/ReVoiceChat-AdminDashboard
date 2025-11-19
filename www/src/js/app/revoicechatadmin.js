export default class ReVoiceChatAdmin {
    #currentTab;

    constructor(){
        this.#selectEventHandler()
        this.#select('overview');
    }

    #select(name) {
        if (this.#currentTab) {
            document.getElementById(`server-setting-tab-${this.#currentTab}`).classList.remove("active");
            document.getElementById(`server-setting-content-${this.#currentTab}`).classList.add("hidden");
        }

        this.#currentTab = name;
        document.getElementById(`server-setting-tab-${this.#currentTab}`).classList.add('active');
        document.getElementById(`server-setting-content-${this.#currentTab}`).classList.remove('hidden');
    }

    #selectEventHandler() {
        const parameters = ['overview', 'members'];
        for (const param of parameters) {
            document.getElementById(`server-setting-tab-${param}`).addEventListener('click', () => this.#select(param));
        }
    }
}