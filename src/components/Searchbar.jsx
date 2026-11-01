import searchIcon from "../assets/Search Icon.png"

export default function SearchBar(){
    return(
        <div className="searchbar">
            <input type="text" placeholder="Busca algun reporte" />
            <button className="searchbar-button">
                <img className="searchbar-img" src={searchIcon} alt="Buscar" />
            </button>
        </div>
    )
}