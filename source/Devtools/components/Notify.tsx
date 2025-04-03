import  React from 'react'

import { useConfigContext } from '../context/localConfigs.context'

export function Notify() {
  const { message , setNotify } = useConfigContext()
  const notifyRef= React.useRef<HTMLDivElement>(null)

  React.useEffect(()=>{
    if(message) {
      notifyRef.current!.classList.add('open')
      setTimeout(()=>{
        notifyRef.current!.classList.remove('open')
        setNotify("")
      },2000)
    }

  },[message, setNotify])

  return <div className='inspector-notify-container' ref={notifyRef}>
    {message}
  </div>
}
