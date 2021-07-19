import chains from "./chain.json";

class Chains {

    /**
     * Read chain information
     * @param id
     * @returns {null||object}
     */
    static getChain(id) {
        let result = null;

        for (const key in chains) {
            const item = chains[key];
            if (item.chainId === id) {
                result = item;
                break;
            }
        }

        return result;
    }

    /**
     * Get Chain Name
     * @param chain
     * @returns {null||string}
     */
    static getName(chain) {
        let result = null;
        if (chain) {
            result = chain.name
        }
        return result;
    }

    /**
     * Get Chain Explorers
     * @param chain
     * @returns {null||array}
     */
    static getExplorers(chain) {
        let result = null;

        if (chain.explorers) {
            result = chain.explorers;
        }

        return result;
    }

    /**
     * Get Chain Testnet
     * @param chain
     * @returns {null}
     */
    static getTestnet(chain){
        let result = null;

        if(chain.network){
            result = chain.network;
        }

        return result;
    }

    /**
     * Get Explorer in Explorers List
     * @param id
     * @param explorers
     * @returns {null}
     */
    static getExplorer(id, explorers) {
        let result = null;

        if (explorers[id]) {
            result = explorers[id];
        }

        return result;
    }

}

export default Chains;
