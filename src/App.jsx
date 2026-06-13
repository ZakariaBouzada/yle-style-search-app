import { useState, useMemo, useEffect } from 'react'
import rawData from './data/Kunnat2.json' // Luetaan uusi JSON-stat2 tiedostosi

function App() {
  const [hakusana, setHakusana] = useState('')
  const [valittuKunta, setValittuKunta] = useState(null)

  // 1. Poimitaan kuntien nimet ja koodit automaattisesti tiedoston metadatasta
  const kuntaNimet = useMemo(() => {
    const nimet = { "SSS": "Koko maa" };
    try {
      // JSON-stat2 -formaatissa alueet löytyvät dimension-objektin alta
      const alueData = rawData?.dimension?.alue_23_20240101?.category?.label;
      if (alueData) {
        return { ...nimet, ...alueData };
      }
    } catch (e) {
      console.error("Virhe nimien poiminnassa metadatasta:", e);
    }
    return nimet;
  }, []);

  // 2. Parsitaan varsinaiset lukuarvot JSON-stat2 flat-taulukosta
  const siivottuData = useMemo(() => {
    if (!rawData || !rawData.value) return [];

    const tulokset = [];
    // Etsitään kuntien indeksit (esim. SSS = 0, KU020 = 1...)
    const alueIndeksit = rawData?.dimension?.alue_23_20240101?.category?.index || {};

    // JSON-stat2:ssa arvot (value) ovat yhdessä pitkässä taulukossa peräkkäin.
    // Koska meillä on 2 tietoa per kunta (kaikki lapset ja vieraskieliset), hypätään aina 2 askelta.
    Object.entries(alueIndeksit).forEach(([koodi, indeksi]) => {
      const arvoIndeksi = indeksi * 2;
      const kaikkiLapset = parseInt(rawData.value[arvoIndeksi], 10);
      const vieraskieliset = parseInt(rawData.value[arvoIndeksi + 1], 10);

      const prosentti = kaikkiLapset > 0 ? parseFloat(((vieraskieliset / kaikkiLapset) * 100).toFixed(1)) : 0;

      // Haetaan kunnalle selkokielinen nimi, muutetaan "KOKO MAA" muotoon "Koko maa"
      let nimi = kuntaNimet[koodi] || `Kunta (${koodi})`;
      if (koodi === 'SSS') nimi = 'Koko maa';

      tulokset.push({
        koodi,
        nimi,
        kaikkiLapset,
        vieraskieliset,
        prosentti
      });
    });

    return tulokset;
  }, [kuntaNimet]);

  // 🔍 DATA-ANALYYSIVAHTI (Seuraa että data latautuu oikein)
  useEffect(() => {
    if (siivottuData.length > 0) {
      const pelkatKunnat = siivottuData.filter(k => k.koodi !== 'SSS');
      const viallisetRivit = pelkatKunnat.filter(k => isNaN(k.kaikkiLapset) || isNaN(k.vieraskieliset));
      const nimeamattomat = pelkatKunnat.filter(k => k.nimi.startsWith('Kunta ('));

      console.log("=== DATAN LAATURAPORTTI ===");
      console.log(`Kuntia ladattu yhteensä: ${pelkatKunnat.length} kpl`);
      console.log(`Korruptoituneita/viallisia rivejä: ${viallisetRivit.length}`);
      console.log(`Kuntia ilman suomenkielistä nimeä: ${nimeamattomat.length}`);
      console.log("==============================");
    }
  }, [siivottuData]);

  // Koko maan keskiarvo vertailupohjaksi (Etsitään koodilla SSS)
  const kokoMaa = useMemo(() => siivottuData.find(k => k.koodi === 'SSS'), [siivottuData]);

  // Suodatetaan kunnat hakukentän tekstin perusteella
  const ehdotukset = useMemo(() => {
    if (!hakusana || valittuKunta?.nimi.toLowerCase() === hakusana.toLowerCase()) return [];
    return siivottuData.filter(k =>
        k.koodi !== 'SSS' &&
        k.nimi.toLowerCase().includes(hakusana.toLowerCase())
    );
  }, [hakusana, siivottuData, valittuKunta]);

  // Journalistinen tekstigeneraattori uutista varten
  const luoUutisTeksti = () => {
    if (!valittuKunta || !kokoMaa) return '';
    const erotus = parseFloat((valittuKunta.prosentti - kokoMaa.prosentti).toFixed(1));
    const suhde = erotus > 0 ? 'korkeampi' : 'matalampi';

    return `Vieraskielisten lasten osuus varhaiskasvatuksessa on kunnassa ${valittuKunta.nimi} ${valittuKunta.prosentti} %. Tämä on ${Math.abs(erotus)} prosenttiyksikköä ${suhde} kuin Suomessa keskimäärin (${kokoMaa.prosentti} %).`;
  };

  return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#111' }}>

        {/* YLEN TYYLINEN OTSIKKO */}
        <header style={{ borderBottom: '3px solid #002f6c', paddingBottom: '10px', marginBottom: '30px' }}>
          <h1 style={{ color: '#002f6c', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            Yle <span style={{ fontWeight: 'normal', color: '#555', fontSize: '20px' }}>| Päiväkotihaku</span>
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Katso oman kuntasi vieraskielisten lasten tilanne päiväkodeissa.</p>
        </header>

        {/* HAKUKONE */}
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <label htmlFor="kuntahaku" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Etsi kuntaa</label>
          <input
              id="kuntahaku"
              type="text"
              placeholder="Kirjoita kunnan nimi (esim. Vantaa...)"
              value={hakusana}
              onChange={(e) => setHakusana(e.target.value)}
              style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />

          {/* PUDOTUSVALIKKO EHDOTUKSILLE */}
          {ehdotukset.length > 0 && (
              <ul style={{ position: 'absolute', width: '100%', background: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: 0, margin: '4px 0 0 0', listStyle: 'none', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {ehdotukset.map(k => (
                    <li
                        key={k.koodi}
                        onClick={() => {
                          setValittuKunta(k);
                          setHakusana(k.nimi);
                        }}
                        style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f4f8'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      {k.nimi}
                    </li>
                ))}
              </ul>
          )}
        </div>

        {/* TULOKSET JA VISUALISOINTI */}
        {valittuKunta && (
            <section style={{ background: '#f5f7fa', padding: '25px', borderRadius: '8px', borderLeft: '6px solid #002f6c' }}>
              <h2 style={{ margin: '0 0 15px 0', color: '#002f6c' }}>{valittuKunta.nimi}</h2>

              <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 25px 0', fontWeight: '500' }}>
                {luoUutisTeksti()}
              </p>

              {/* DATAPALKIT */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: '#444', fontWeight: 'bold' }}>
                  <span>0 %</span>
                  <span>100 %</span>
                </div>

                {/* Mittaripalkki */}
                <div style={{ width: '100%', height: '28px', background: '#e2e8f0', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>

                  {/* Kunnan oma osuus sinisellä */}
                  <div style={{ width: `${valittuKunta.prosentti}%`, height: '100%', background: '#002f6c', transition: 'width 0.3s ease' }}></div>

                  {/* Koko maan keskiarvo punaisena pystyviivana */}
                  {kokoMaa && (
                      <div style={{ position: 'absolute', left: `${kokoMaa.prosentti}%`, top: 0, width: '4px', height: '100%', background: '#e53e3e', zIndex: 2 }}>
                        <span style={{ position: 'absolute', top: '-22px', left: '-40px', fontSize: '11px', color: '#e53e3e', fontWeight: 'bold', width: '90px', textAlign: 'center' }}>
                          Suomi ({kokoMaa.prosentti}%)
                        </span>
                      </div>
                  )}
                </div>
              </div>
            </section>
        )}

      </div>
  )
}

export default App