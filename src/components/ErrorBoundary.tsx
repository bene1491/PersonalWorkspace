import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boundary-screen">
          <AlertTriangle size={26} />
          <h2>Dieser Bereich konnte nicht angezeigt werden.</h2>
          <p>Ein unerwarteter Fehler ist lokal in der Benutzeroberfläche aufgetreten. Deine gespeicherten Daten sind davon nicht betroffen.</p>
          <button className="button button-primary" onClick={() => { this.setState({ error: null }); window.location.assign('/') }}>Zum Command Center</button>
        </div>
      )
    }
    return this.props.children
  }
}
