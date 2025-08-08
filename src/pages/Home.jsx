import Footer from "../Components/Footer"
import Heading from "../Components/Heading"
import Navbar from "../Components/Navbar";
import '../Components/amination.css'
import '../App.css';
const Home = () => {
  
  return (
    < div className="flex flex-col min-h-screen bg-black ">
   
    <Navbar />
<div className="flex justify-center items-center">
        <Heading />
      </div>
    <Footer />
    </div>
  )
}

export default Home