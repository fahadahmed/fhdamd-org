import './input.css'

export type InputProps = {
  type: string
  name: string
  id: string
  value: string | number
  labelText?: string
  setValue: React.Dispatch<React.SetStateAction<string | number>>
}

export default function Input({ type, name, id, value, labelText, setValue }: InputProps) {
  return (
    <div className="input-container">
      <label htmlFor={name}>{labelText}</label>
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}