import CircleLoader from "react-spinners/ClipLoader";


function LoadingOverlay({
    isLoading = false,
    loadingText = "",
    isFullscreen = false,
}){

    if(!isLoading){
        return;
    }

    const override = {
        opacity: .5,
        borderColor: "black",
    };

    const layout = isFullscreen ? `model`:`container_model`;
    const size = isFullscreen ? 150 : 15;

    return(<>
        <div className={layout}>
            <div className="loading_container">
                <CircleLoader
                    color={"#ffffff"}
                    loading={true}
                    cssOverride={override}
                    size={size}
                    aria-label="Loading Spinner"
                    data-testid="loader"/>   
                <div className="loading_text">
                    {loadingText}
                </div>
            </div> 
        </div> 
    </>);
}

export default LoadingOverlay;

