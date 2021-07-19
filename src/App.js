import logo from './logo.svg';
import './App.css';
import Vote from "./components/Vote";
import {GiJigsawBox} from "react-icons/all";

function App() {
    return (
        <div className="App">

            <header className="App-header">
                <GiJigsawBox size={64}/>
                <h1>
                    Crypto Vote
                </h1>
                <h2 className={"fst-italic"}>{'{ '}Prototype{' }'}</h2>
            </header>

            <Vote/>

        </div>
    );
}

export default App;
