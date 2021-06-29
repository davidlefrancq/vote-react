import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";
import StringUtils from "../utils/StringUtils";

const addressContract = "0xbe1dC92Fe08BBFAE31E2362bF2c66EdcEE2E2196";

class Vote extends Component {

    /**
     * Ethereum Object
     */
    ethereum;

    /**
     * Instance Contract Solidity
     */
    contract;

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
            transactionHash: null,
        };

        this.ethereum = window.ethereum;
    }

    /**
     * Initialisation du "Circle Life" de notre connexion Web3JS
     */
    initEthereumEvents = () => {
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

    initContract = () => {

        // Chargement du contract
        const web3 = new Web3(Web3.givenProvider);
        const myContract = new web3.eth.Contract(
            jsonInterface,
            addressContract
        );

        // Sauvegarde dans une variable local du composant React
        this.contract = myContract;
        this.initQuestion();
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

            this.initEthereumEvents();
            this.initContract();

        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Intéroge le contract pour récupérer la question
     * @returns {Promise<void>}
     */
    getQuestion = async () => {

        // Si Web3 est connecté
        const {web3Account} = this.state.isConnected;
        if (web3Account.length > 0) {

            // Exécution d'une requete sur le Contract Solidity
            this.contract.methods.question().call({from: web3Account[0]}).then((result) => {

                // Enregistre la question dans l'état du composant react
                this.setQuestionState(result);

            }).catch((error) => {
                console.error(error);
            });
        }
    }


    /**
     * Intéroge le contract pour récupérer les réponses possible
     * @returns {Promise<void>}
     */
    getAnswerChoices = async () => {

        // Si Web3 est connecté
        const {web3Account} = this.state.isConnected;
        if (web3Account.length > 0) {

            // Exécution d'une requete sur le Contract Solidity
            this.contract.methods.getAnswerChoices().call({from: web3Account[0]}).then((result) => {

                console.log(result);
                this.setAnswerChoicesState([result[0], result[1]]);

            }).catch((error) => {
                console.error(error);
            });
        }
    }

    setStateTransactionHash = (transactionHash) => {
        const state = {...this.state};
        state.transactionHash = transactionHash;
        this.setState(state);
    }

    addAnswer = async (choice) => {

        // Si Web3 est connecté
        const {web3Account} = this.state.isConnected;
        if (web3Account.length > 0) {

            // Exécution d'une requete sur le Contract Solidity
            this.contract.methods.addAnswer(choice).send({from: web3Account[0]}).then((result) => {

                console.log(result);
                const {
                    blockHash,
                    blockNumber,
                    contractAddress,
                    cumulativeGasUsed,
                    from,
                    gasUsd,
                    status,
                    to,
                    transactionHash
                } = result;

                this.setStateTransactionHash(transactionHash);

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
    initQuestion = () => {
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
                    <h2>Account</h2>
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
                <button className={"btn btn-outline-primary"} onClick={this.connectToWeb3}>Connection Web3</button>
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

    submitHandle = (event) => {
        event.preventDefault();
        const choice = event.target.choice.value;
        this.addAnswer(choice);
    }

    renderChoices() {
        return this.state.answerChoices.map((answerChoice, index) => {
            return (
                <div key={index} className={"ps-2 pe-2"}>
                    <input className={"m-1"} value={index} type="radio" name="choice"/>
                    {answerChoice}
                </div>
            );
        });
    }

    /**
     * Rendu des réponses possible
     * @returns {unknown[]}
     */
    renderAnswerChoices() {
        if (this.state.answerChoices && this.state.answerChoices.length > 0) {
            return (
                <form onSubmit={this.submitHandle}>

                    <div className={"d-flex justify-content-center"}>
                        {this.renderChoices()}
                    </div>
                    <button className={"btn btn-primary"} type={"submit"}>Send</button>
                </form>
            );
        }
    }

    renderTransactionHash() {
        if (this.state.transactionHash) {
            return (
                <div>
                    <h2>Transaction</h2>
                    <a href={`https://kovan.etherscan.io/tx/${this.state.transactionHash}`} target={"_blank"}>
                        {StringUtils.addressMinimise(this.state.transactionHash)}
                    </a>
                </div>
            )
        }
    }

    /**
     * Fonction de rendu appelé par defaut pas React
     * @returns {JSX.Element}
     */
    render() {
        return (
            <div className={"container"}>
                <div className={"row"}>
                    <div className={"col"}>
                        {this.renderWeb3Connection()}
                    </div>
                    <div className={"col"}>
                        <div className={"row"}>
                            <div className={"col"}>
                                <h2>Question</h2>
                                {this.state.question}
                                {this.renderAnswerChoices()}
                            </div>
                            <div className={"col"}>
                                {this.renderTransactionHash()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default Vote;
