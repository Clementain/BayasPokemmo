import { Calculadora } from "./src/Calculadora";
// Se crea la función App que retorna el componente NavigationContainer y el componente Navegacion
function App(): React.JSX.Element {


  return (
    // Se retorna el componente NavigationContainer que contiene el componente AppProvider y el componente Navegacion
    <Calculadora />
  );
}



export default App;