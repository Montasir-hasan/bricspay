import '../App.css';
import loadingImage from '../assets/fan.png';

const Loader = () => {
  return (
    <div className="loading-screen">
      <img className='w-[80%]' src={loadingImage} alt="Loading" />
    </div>
  )
}

export default Loader