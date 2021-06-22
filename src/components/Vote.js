import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";

class Vote extends Component {

    ethereum;

    constructor(props) {
        super(props);
        this.state = {
            isConnected: {
                web3: false,
                web3Account: null,
            },
            question: null,
        };
        this.ethereum = window.ethereum;
    }

    /**
     * Initialisation du "Circle Life" de notre connexion Web3JS
     */
    initEthereum = () => {
        this.ethereum.on('accountsChanged', (accounts) => {
            console.log("accountsChanged accounts", accounts, this.ethereum.isConnected());
            if (this.ethereum.isConnected()) {
                this.connectToWeb3();
            }
        });
        this.ethereum.on('disconnect', (accounts) => {
            console.log("disconnect accounts", accounts);
            this.disconnectedWeb3();
        });
    }

    /**
     * Deconnexion
     */
    disconnectedWeb3 = () => {
        const state = {...this.state};
        state.isConnected.web3 = false;
        state.isConnected.web3Account = null;
        this.setState(state);
    }

    /**
     * Connexion Web3JS
     */
    connectToWeb3 = () => {
        this.ethereum.request({method: 'eth_requestAccounts'}).then((result) => {
            const state = {...this.state};
            state.isConnected.web3 = true;
            state.isConnected.web3Account = result;
            this.setState(state);
            this.initEthereum();
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Intéroge le contract pour récupérer la question
     * @returns {Promise<void>}
     */
    getQuestion = async () => {

        // Chargement du contract
        const web3 = new Web3(Web3.givenProvider);
        const myContract = new web3.eth.Contract(
            jsonInterface,
            "0xbe1dC92Fe08BBFAE31E2362bF2c66EdcEE2E2196"
        );

        const {web3Account} = this.state.isConnected;
        if (web3Account.length > 0) {

            // Requete Ethereum
            myContract.methods.question().call({from: web3Account[0]}).then((result) => {

                // Enregistre la question dans l'état du composant react
                this.setQuestionState(result);

            }).catch((error) => {
                console.error(error);
            });
        }
    }

    /**
     * Enregistre le changement de question dans l'état du composant React
     * @param question
     */
    setQuestionState = (question) => {
        const state = {...this.state};
        state.question = question;
        this.setState(state);
    }


    renderWeb3IsConnected() {
        if (this.state.isConnected.web3) {
            return (
                <div>
                    <div>Account</div>
                    <div>{this.state.isConnected.web3Account}</div>
                </div>
            );
        }
    }

    renderWeb3ConnectionButton() {
        if (!this.state.isConnected.web3) {
            return (
                <button onClick={this.connectToWeb3}>Connection Web3</button>
            );
        }
    }

    renderWeb3Connection() {
        return (
            <div>
                {this.renderWeb3ConnectionButton()}
                {this.renderWeb3IsConnected()}
            </div>
        );
    }

    renderGetInfo() {
        return (
            <div>
                <button onClick={this.getQuestion}>Get Infos</button>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderWeb3Connection()}
                {this.renderGetInfo()}

            </div>
        );
    }
}

export default Vote;
