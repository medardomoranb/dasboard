import './App.css'

import Grid from '@mui/material/Grid2' 
import TableWeather from './components/TableWeather';
import ControlWeather from './components/ControlWeather';
import LineChartWeather from './components/LineChartWeather';
import IndicatorWeather from './components/IndicatorWeather';


import Item from './interface/Item';

 import { useEffect, useState } from 'react';

 interface Indicator {
    title?: String;
    subtitle?: String;
    value?: String;
  }


function App() {

    // Variable de estado para un arreglo del tipo Item
  const [items, setItems] = useState<Item[]>([]);

     {/* Variable de estado y función de actualización */}
     let [indicators, setIndicators] = useState<Indicator[]>([])
     let [owm, setOWM] = useState(localStorage.getItem("openWeatherMap"))
     


       {/* Hook: useEffect */}

     useEffect(()=>{

        let request = async () => {

             {/* Referencia a las claves del LocalStorage: openWeatherMap y expiringTime */}
             let savedTextXML = localStorage.getItem("openWeatherMap") || "";
             let expiringTime = localStorage.getItem("expiringTime");

             {/* Obtenga la estampa de tiempo actual */}
             let nowTime = (new Date()).getTime();

              {/* Verifique si es que no existe la clave expiringTime o si la estampa de tiempo actual supera el tiempo de expiración */}
              if(expiringTime === null || nowTime > parseInt(expiringTime)) {



              {/* Request */}
              let API_KEY = "58a5ba23d2871a86fa8983817686e99b"
              let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Guayaquil&mode=xml&appid=${API_KEY}`)
              let savedTextXML = await response.text();

               {/* Tiempo de expiración */}
               let hours = 0.01
               let delay = hours * 3600000
               let expiringTime = nowTime + delay


               {/* En el LocalStorage, almacene el texto en la clave openWeatherMap, estampa actual y estampa de tiempo de expiración */}
               localStorage.setItem("openWeatherMap", savedTextXML)
               localStorage.setItem("expiringTime", expiringTime.toString())
               localStorage.setItem("nowTime", nowTime.toString())

               {/* DateTime */}
               localStorage.setItem("expiringDateTime", new Date(expiringTime).toString())
               localStorage.setItem("nowDateTime", new Date(nowTime).toString())

               {/* Modificación de la variable de estado mediante la función de actualización */ }
               setOWM( savedTextXML )
           }

           
             {/* Valide el procesamiento con el valor de savedTextXML */}
             if( savedTextXML ) {

            {/* XML Parser */}
            const parser = new DOMParser();
            const xml = parser.parseFromString(savedTextXML, "application/xml");

            {/* Arreglo para agregar los resultados */}

            let dataToIndicators : Indicator[] = new Array<Indicator>();
            

            {/* 
                Análisis, extracción y almacenamiento del contenido del XML 
                en el arreglo de resultados
            */}

            let name = xml.getElementsByTagName("name")[0].innerHTML || ""
            dataToIndicators.push({"title":"Location", "subtitle": "City", "value": name})

            let location = xml.getElementsByTagName("location")[1]

            let latitude = location.getAttribute("latitude") || ""
            dataToIndicators.push({ "title": "Location", "subtitle": "Latitude", "value": latitude })

            let longitude = location.getAttribute("longitude") || ""
            dataToIndicators.push({ "title": "Location", "subtitle": "Longitude", "value": longitude })

            let altitude = location.getAttribute("altitude") || ""
            dataToIndicators.push({ "title": "Location", "subtitle": "Altitude", "value": altitude })

      

             {/* Modificación de la variable de estado mediante la función de actualización */}
             setIndicators( dataToIndicators )
                
            }

            let times = xml.getElementsByTagName('time');
        const dataToItems: Item[] = [];

        for (let i = 0; i < times.length && i < 6; i++) {
          const time = times[i];
          const dateStart = time.getAttribute('from') || '';
          const dateEnd = time.getAttribute('to') || '';
          const precipitation = time.querySelector('precipitation')?.getAttribute('probability') || '';
          const humidity = time.querySelector('humidity')?.getAttribute('value') || '';
          const clouds = time.querySelector('clouds')?.getAttribute('all') || '';

          dataToItems.push({ dateStart, dateEnd, precipitation, humidity, clouds });
        }

        setItems(dataToItems);
        }

        request();


    },[owm])

    let renderIndicators = () => {

        return indicators
                .map(
                    (indicator, idx) => (
                        <Grid key={idx} size={{ xs: 12, xl: 3 }}>
                            <IndicatorWeather 
                                title={indicator["title"]} 
                                subtitle={indicator["subtitle"]} 
                                value={indicator["value"]} />
                        </Grid>
                    )
                )
                   
    }

    return (
        <Grid container spacing={5}>
    
          {/* Indicadores */}
          
          {renderIndicators()}
    
          {/* Tabla */}
          <Grid size={{ xs: 12, xl: 8 }}>
    
            {/* Grid Anidado */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, xl: 3 }}>
                <ControlWeather />
              </Grid>
              <Grid size={{ xs: 12, xl: 9 }}>
                <TableWeather itemsIn={items}/>
              </Grid>
            </Grid>
    
          </Grid>
    
    
          {/* Gráfico */}
          <Grid size={{ xs: 12, xl: 4 }}>
            <LineChartWeather />
          </Grid>
    
        </Grid>
      )
}

export default App
