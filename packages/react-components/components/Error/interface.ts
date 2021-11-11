export interface ErrorInitData {
  messages?: string
}

export interface GuardErrorProps {
  initData?: ErrorInitData
}

export interface GuardErrorViewProps extends GuardErrorProps {}
