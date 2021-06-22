import logo from './logo.svg';
import './App.css';
import Vote from "./components/Vote";

function App() {
    return (
        <div className="App">

            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Crypto Vote
                </p>
            </header>

            <Vote/>

        </div>
    );
}

export default App;
