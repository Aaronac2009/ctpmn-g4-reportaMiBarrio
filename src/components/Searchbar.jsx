import searchIcon from "../assets/Search Icon.png"

export default function SearchBar({ onBuscar }){
    function buscar(evento) {
        evento.preventDefault()
        onBuscar(evento.currentTarget.elements.consulta.value.trim())
    }
    return(
        <form className="searchbar" role="search" onSubmit={buscar}>
            <input type="search" name="consulta" aria-label="Buscar un reporte" placeholder="Busca un reporte" onChange={e => {
                if (!e.target.value.trim()) onBuscar("")
            }} />
            <button type="submit" className="searchbar-button">
                <img className="searchbar-img" src={searchIcon} alt="Buscar" />
            </button>
        </form>
    )
}
