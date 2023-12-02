
import LoadingOverlay from './LoadingOverlay'
import '../styles.css';

const LoadingWrapper = ({loading, children}) =>(
    <>
        <div className="load_wrapper">
            <LoadingOverlay 
                isLoading={loading} 
                isFullscreen={false}
                loadingText={"Loading Data"}/>
            {children}
        </div>
    </>)

export default LoadingWrapper;

