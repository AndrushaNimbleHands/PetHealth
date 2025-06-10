import '../assets/styles/main.scss';


export default function Selector({className, label, value, onChange, option, speciesList}) {
    return (
        <div className={`selector ${className}`}>
            <label>{label}</label>
            <select value={value} onChange={onChange}>
                <option value="" disabled={true}>{option}</option>
                {speciesList.length > 0 && speciesList.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
        </div>
    );
}

