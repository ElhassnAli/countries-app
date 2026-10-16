import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Search } from "lucide-react";
import Header from "./components/Header";
import countries from "./data/data.json";

const regions = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
const numberFormatter = new Intl.NumberFormat("en-US");

function getCountryFromPath() {
  const match = window.location.pathname.match(/^\/country\/([^/]+)\/?$/);
  return match
    ? countries.find((country) => country.alpha3Code === match[1]) ?? null
    : null;
}

function displayList(items, property = "name") {
  return Array.isArray(items)
    ? items.map((item) => (typeof item === "string" ? item : item?.[property])).filter(Boolean).join(", ") || "—"
    : "—";
}

function CountryCard({ country, onSelect }) {
  return (
    <button
      className="country-card text-left"
      type="button"
      onClick={() => onSelect(country)}
      aria-label={`View details for ${country.name}`}
    >
      <img className="country-flag" src={country.flags?.svg ?? country.flags?.png ?? country.flag} alt={`${country.name} flag`} />
      <span className="country-card-content">
        <span className="country-card-name">{country.name}</span>
        <span className="country-card-facts">
          <span><strong>Population:</strong> {numberFormatter.format(country.population ?? 0)}</span>
          <span><strong>Region:</strong> {country.region || "—"}</span>
          <span><strong>Capital:</strong> {displayList(country.capital ? [country.capital] : [])}</span>
        </span>
      </span>
    </button>
  );
}

function CountryDetail({ country, onBack, onSelect }) {
  const borderCountries = (country.borders ?? [])
    .map((code) => countries.find((item) => item.alpha3Code === code))
    .filter(Boolean);

  return (
    <main className="page-content detail-page">
      <button className="back-button inline-flex items-center gap-3" onClick={onBack} type="button">
        <ArrowLeft size={20} strokeWidth={1.8} aria-hidden="true" />
        <span>Back</span>
      </button>

      <section className="country-detail">
        <img
          className="detail-flag"
          src={country.flags?.svg ?? country.flags?.png ?? country.flag}
          alt={`${country.name} flag`}
        />

        <div className="detail-information">
          <h2 className="detail-title">{country.name}</h2>
          <div className="detail-facts">
            <div className="detail-fact-column">
              <p><strong>Native Name:</strong> {country.nativeName || "—"}</p>
              <p><strong>Population:</strong> {numberFormatter.format(country.population ?? 0)}</p>
              <p><strong>Region:</strong> {country.region || "—"}</p>
              <p><strong>Sub Region:</strong> {country.subregion || "—"}</p>
              <p><strong>Capital:</strong> {displayList(country.capital ? [country.capital] : [])}</p>
            </div>
            <div className="detail-fact-column">
              <p><strong>Top Level Domain:</strong> {displayList(country.topLevelDomain)}</p>
              <p><strong>Currencies:</strong> {displayList(country.currencies)}</p>
              <p><strong>Languages:</strong> {displayList(country.languages)}</p>
            </div>
          </div>

          <div className="border-countries">
            <h3>Border Countries:</h3>
            <div className="border-country-list">
              {borderCountries.length > 0 ? borderCountries.map((borderCountry) => (
                <button
                  className="border-country-button"
                  key={borderCountry.alpha3Code}
                  type="button"
                  onClick={() => onSelect(borderCountry)}
                >
                  {borderCountry.name}
                </button>
              )) : <span className="no-borders">None</span>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(getCountryFromPath);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return window.localStorage.getItem("countries-theme") !== "light";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handlePopState = () => setSelectedCountry(getCountryFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("countries-theme", darkMode ? "dark" : "light");
    } catch {
      // Theme selection still works for the current page when storage is unavailable.
    }
  }, [darkMode]);

  const filteredCountries = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return countries.filter((country) => {
      const matchesSearch = country.name.toLocaleLowerCase().includes(query);
      const matchesRegion = !selectedRegion || country.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion]);

  function selectCountry(country) {
    window.history.pushState({}, "", `/country/${country.alpha3Code}`);
    setSelectedCountry(country);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function goHome() {
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
    setSelectedCountry(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function goBack() {
    if (window.history.state && window.location.pathname !== "/") {
      window.history.back();
    } else {
      goHome();
    }
  }

  return (
    <div className={`app-shell ${darkMode ? "theme-dark" : "theme-light"}`}>
      <Header
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((current) => !current)}
        onHome={goHome}
      />

      {selectedCountry ? (
        <CountryDetail country={selectedCountry} onBack={goBack} onSelect={selectCountry} />
      ) : (
        <main className="page-content home-page">
          <div className="toolbar">
            <label className="search-control">
              <Search size={19} aria-hidden="true" />
              <span className="sr-only">Search for a country</span>
              <input
                type="search"
                placeholder="Search for a country..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="region-filter">
              <button
                className="region-filter-trigger flex items-center justify-between"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isRegionMenuOpen}
                onClick={() => setIsRegionMenuOpen((open) => !open)}
              >
                <span>{selectedRegion || "Filter by Region"}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              {isRegionMenuOpen && (
                <ul className="region-options" role="listbox" aria-label="Filter by region">
                  {regions.map((region) => (
                    <li key={region}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedRegion === region}
                        onClick={() => {
                          setSelectedRegion((current) => current === region ? "" : region);
                          setIsRegionMenuOpen(false);
                        }}
                      >
                        {region}
                      </button>
                    </li>
                  ))}
                  {selectedRegion && (
                    <li>
                      <button
                        type="button"
                        role="option"
                        aria-selected="false"
                        onClick={() => {
                          setSelectedRegion("");
                          setIsRegionMenuOpen(false);
                        }}
                      >
                        All regions
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {filteredCountries.length > 0 ? (
            <section className="country-grid" aria-label="Countries">
              {filteredCountries.map((country) => (
                <CountryCard key={country.alpha3Code} country={country} onSelect={selectCountry} />
              ))}
            </section>
          ) : (
            <p className="empty-state">No countries found. Try another search or region.</p>
          )}
        </main>
      )}
    </div>
  );
}
