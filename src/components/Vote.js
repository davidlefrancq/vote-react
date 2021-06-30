import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";
import AddressFormater from "../utils/AddressFormater";
import {CANCELED, SUCCESS, Transaction} from "./transactions/bo/Transaction";
import Transactions from "./transactions/Transactions";
import Chains from "./chains/Chains";
import VotersList from "./VotersList";
import Explorers from "./explorers/Explorers";
import QuestionStatistics from "./statistics/QuestionStatistics";

const addressContract = "0xc8BDE76aD7b7D2D3D378a8f335FEE4d1De8bF902";

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
            idChain: null,
            isConnected: false,
            accounts: null,
            question: null,
            answerChoices: [],
            transactions: [],
            transactionInProgress: false,
            votersList: [],
        };
    }

    /**
     * Exécuter lorsque le composant est monté
     */
    componentDidMount() {
        this.init();
    }

    /**
     * Initialisation
     */
    init() {
        this.ethereum = window.ethereum;
        this.initStateChainId();
    }

    /**
     * Récupérer la liste des Votes
     * @returns {Promise<void>}
     */
    initVotersList = async () => {

        // Nombre de réponse (vote)
        let nbResponse = 0;
        await this.getNbResponse().then((number) => {
            nbResponse = Number.parseInt(number);
        });

        // Liste des participants
        let participants = [];
        await this.getParticipants(nbResponse).then((items) => {
            participants = items;
        });

        // Liste des réponses
        let responses = [];
        await this.getResponses(participants).then((items) => {
            responses = items;
        });

        // Enregistrement de la liste des réponses dans le State
        this.setStateVotersList(responses);
    }

    /**
     * Récupérer la liste des réponses (vote) faites sur le Contract
     * @param participants
     * @returns Array(int,object)
     */
    async getResponses(participants) {
        const responses = [];
        let i = 0;
        for (const key in participants) {
            const participant = participants[key];
            const response = await this.getResponse(participant);
            responses[i] = {...response, address: participant};
            i++;
        }
        return responses;
    }

    /**
     * Récupérer une liste de participant
     * @param nbResponse
     * @returns Array(int,string)
     */
    async getParticipants(nbResponse) {
        const participants = [];
        for (let i = 0; i < nbResponse; i++) {
            await this.getParticipant(i).then((participant) => {
                participants.push(participant);
            });
        }
        return participants;
    }

    /**
     * Récupérer le nombre de Vote ayant été effectué sur le Contract
     * @returns {*}
     */
    getNbResponse() {
        return this.contract.methods.nbResponse().call({from: this.state.accounts[0]});
    }

    /**
     * Récupérer un participant
     * @param index
     * @returns {*}
     */
    getParticipant(index) {
        return this.contract.methods.listResponces(index).call({from: this.state.accounts[0]});
    }

    /**
     * Récupérer la réponse d'un participant
     * @param participant
     * @returns {*}
     */
    getResponse(participant) {
        return this.contract.methods.responses(participant).call({from: this.state.accounts[0]});
    }

    /**
     * Enregistrer une liste de votants dans le State
     * @param votersList
     */
    setStateVotersList = (votersList) => {
        const state = {...this.state};
        state.votersList = votersList;
        this.setState(state);
    }

    /**
     * Initialisation du "Circle Life" de notre connexion Web3JS
     */
    initEthereumEvents = () => {
        this.ethereum.on('accountsChanged', (accounts) => {
            if (this.ethereum.isConnected()) {
                this.connectToWeb3();
            }
        });
        this.ethereum.on('disconnect', (accounts) => {
            this.disconnectedWeb3();
        });
    }

    /**
     * Initialiser le Contract
     */
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
        this.initVotersList();
    }

    /**
     * Enregister l'ID du réseaux blockchain que l'utilisation utlise
     * @returns {Promise<void>}
     */
    initStateChainId = async () => {
        const chainId = await window.ethereum.request({method: 'eth_chainId'});

        const state = {...this.state};
        state.chainId = chainId;
        this.setState(state);
    }


    /**
     * Deconnexion
     */
    disconnectedWeb3 = () => {
        const state = {...this.state};
        state.isConnected = false;
        state.accounts = null;
        this.setState(state);
    }

    /**
     * Connexion Web3JS
     */
    connectToWeb3 = () => {
        this.ethereum.request({method: 'eth_requestAccounts'}).then((result) => {

            const state = {...this.state};
            state.isConnected = true;
            state.accounts = result;
            this.setState(state);

            this.initEthereumEvents();
            this.initContract();

        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Mettre à jour la valeur "transactionInProgress" du State
     * @param value
     */
    setTransactionInProgress = (value) => {
        const state = {...this.state};
        state.transactionInProgress = value;
        this.setState(state);
    }

    /**
     * Intéroge le contract pour récupérer la question
     * @returns {Promise<void>}
     */
    getQuestion = async () => {

        // Si Web3 est connecté
        const {accounts} = this.state;
        if (accounts.length > 0) {

            // Exécution d'une requete sur le Contract Solidity
            this.contract.methods.question().call({from: accounts[0]}).then((result) => {

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
    getAnswerChoices = () => {

        // Si Web3 est connecté
        const {accounts} = this.state;
        if (accounts.length > 0) {

            this.contract.methods.getNumberAnswerChoices().call({from: accounts[0]}).then(async (num) => {

                const number = Number.parseInt(num);
                const answerChoices = [];
                for (let i = 0; i < number; i++) {

                    try {
                        // Exécution d'une requete sur le Contract Solidity
                        const result = await this.contract.methods.answerChoices(i).call({from: accounts[0]});
                        answerChoices.push(result);

                        if (i == (number - 1)) {
                            this.setAnswerChoicesState(answerChoices);
                        }

                    } catch (error) {
                        console.error(error);
                    }
                }

            }).catch((error) => {
                console.error(error);
            });


        }
    }

    /**
     * Ajouter une transation au State
     * @param transaction
     */
    addTransaction = (transaction) => {
        const state = {...this.state};
        state.transactions.push(transaction);
        this.setState(state);
    }

    /**
     * Envoyer une réponse au Contract
     * @param choice
     * @returns {Promise<void>}
     */
    addAnswer = async (choice) => {

        const transaction = new Transaction(this.state.accounts[0], choice);
        this.addTransaction(transaction);
        this.setTransactionInProgress(true);

        // Si Web3 est connecté
        const {accounts} = this.state;
        if (accounts.length > 0) {

            // Exécution d'une requete sur le Contract Solidity
            this.contract.methods.addAnswer(choice).send({from: accounts[0]}).then((result) => {

                transaction.status = SUCCESS;
                this.setTransactionInProgress(false);

            }).catch((error) => {
                transaction.status = CANCELED;
                this.setTransactionInProgress(false);
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
        if (this.state.isConnected) {
            const account = this.state.accounts[0];
            const chain = Chains.getChain(this.state.chainId);

            return (
                <div className={"p-3"}>
                    <h2>Account</h2>
                    <div className={"d-flex justify-content-center"}>
                        <div className={"pb-0 pt-2"}>
                            {AddressFormater.minimizer(this.state.accounts[0])}
                        </div>
                        <Explorers chain={chain} account={account}/>
                    </div>
                </div>
            );
        }
    }

    /**
     * Rendu du bouton de connexion Web3JS
     * @returns {JSX.Element}
     */
    renderWeb3ConnectionButton() {
        if (!this.state.isConnected) {
            return (
                <div className={"p-3"}>
                    <button className={"btn btn-outline-primary"} onClick={this.connectToWeb3}>Connection Web3</button>
                </div>
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
     * Envoyer la réponse
     * @param event
     */
    submitHandle = (event) => {
        event.preventDefault();
        const choice = event.target.choice.value;
        this.addAnswer(choice);
    }

    /**
     * Rendu des choix possible
     * @returns {unknown[]}
     */
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
                    <button className={"btn btn-primary"} type={"submit"}
                            disabled={this.state.transactionInProgress}>Send
                    </button>
                </form>
            );
        }
    }

    renderQuestion() {
        if (this.state.question) {
            return (
                <div className={"p-3"}>
                    <h2>Question</h2>
                    {this.state.question}
                    {this.renderAnswerChoices()}
                </div>
            );
        }
    }

    /**
     * Rendu des transactions en mémoire
     * @returns {JSX.Element}
     */
    renderTransactions() {
        if (this.state.chainId && this.state.transactions && this.state.transactions.length > 0) {
            const chain = Chains.getChain(this.state.chainId)
            return (
                <Transactions transactions={this.state.transactions} chain={chain}/>
            );
        }
    }

    /**
     * Rendu des votes
     * @returns {JSX.Element}
     */
    renderVotersList() {
        if (this.state.votersList && this.state.votersList.length > 0) {
            const chain = Chains.getChain(this.state.chainId);
            return (
                <div>
                    <VotersList
                        votersList={this.state.votersList}
                        answerChoices={this.state.answerChoices}
                        chain={chain}
                    />
                </div>
            );
        }
    }

    renderStatistics() {
        if (this.state.votersList && this.state.votersList.length > 0) {
            return (
                <QuestionStatistics items={this.state.votersList} answerChoices={this.state.answerChoices}/>
            );
        }
    }

    /**
     * Fonction de rendu appelé par defaut pas React
     * @returns {JSX.Element}
     */
    render() {
        return (
            <div className={"container mt-3"}>

                <div className={"row shadow"}>
                    <div className={"col"}>
                        {this.renderWeb3Connection()}
                    </div>
                    <div className={"col"}>
                        {this.renderQuestion()}
                        {this.renderTransactions()}
                    </div>
                    <div className={"col"}>
                        {this.renderStatistics()}
                    </div>
                </div>

                <div className={"row"}>

                    <div className={"col"}>
                        {this.renderVotersList()}
                    </div>

                </div>

            </div>
        );
    }

}

export default Vote;
