function Svg({use, className, width, height}) {

    return (
        <>
            <svg className={className} width={width ?? null} height={height ?? null}>
                <use href={`${use}`}></use>
            </svg>
        </>
    )
}

export default Svg