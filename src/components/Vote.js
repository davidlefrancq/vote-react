import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";

class Vote extends Component {

    // Variable ethereum
    // Note : Ne doit pas faire partie du "State React" car il pourrait perturber le cycle de vie du composant React
    ethereum;

    /**
     * Constructeur
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isConnected: {
                web3: false,
                web3Account: null,
            },
            question: null,
            answerChoices: [],
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

            this.getAnswerChoices();
        }
    }


    /**
     * Intéroge le contract pour récupérer les réponses possible
     * @returns {Promise<void>}
     */
    getAnswerChoices = async () => {
        // Chargement du contract
        const web3 = new Web3(Web3.givenProvider);
        const myContract = new web3.eth.Contract(
            jsonInterface,
            "0xbe1dC92Fe08BBFAE31E2362bF2c66EdcEE2E2196"
        );

        const {web3Account} = this.state.isConnected;
        if (web3Account.length > 0) {

            // Requete Ethereum
            myContract.methods.getAnswerChoices().call({from: web3Account[0]}).then((result) => {

                console.log(result);
                this.setAnswerChoicesState([result[0], result[1]]);

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

    /**
     * Enregistre le changement des réponses proposées dans l'état du composant React
     * @param responses
     */
    setAnswerChoicesState = (responses) => {
        const state = {...this.state};
        state.answerChoices = responses;
        this.setState(state);
    }

    /**
     * Exécuter les requetes de lecture du Contract Solidity
     */
    readContractHandle = () => {
        this.getQuestion();
        this.getAnswerChoices();
    }

    /**
     * Rendu lorsque Web3JS est connecté
     * @returns {JSX.Element}
     */
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

    /**
     * Rendu du bouton de connexion Web3JS
     * @returns {JSX.Element}
     */
    renderWeb3ConnectionButton() {
        if (!this.state.isConnected.web3) {
            return (
                <button onClick={this.connectToWeb3}>Connection Web3</button>
            );
        }
    }

    /**
     * Rendu les éléments d'interaction Web3JS (bouton, status de connexion)
     * @returns {JSX.Element}
     */
    renderWeb3Connection() {
        return (
            <div>
                {this.renderWeb3ConnectionButton()}
                {this.renderWeb3IsConnected()}
            </div>
        );
    }

    /**
     * Rendu des boutons d'interaction avec le Contract Solidity
     * @returns {JSX.Element}
     */
    renderButtons() {
        return (
            <div>
                <button onClick={this.readContractHandle}>Read Contract</button>
            </div>
        );
    }

    /**
     * Rendu des réponses possible
     * @returns {unknown[]}
     */
    renderAnswerChoices() {
        if (this.state.answerChoices) {
            return this.state.answerChoices.map((answerChoice, index) => {
                return (
                    <div key={index}>
                        <input value={index} type="radio" name="choice"  />
                        {answerChoice}
                    </div>
                );
            });
        }
    }

    /**
     * Fonction de rendu appelé par defaut pas React
     * @returns {JSX.Element}
     */
    render() {
        return (
            <div>
                {this.renderWeb3Connection()}
                {this.renderButtons()}
                {this.state.question}
                {this.renderAnswerChoices()}
            </div>
        );
    }

}

export default Vote;
