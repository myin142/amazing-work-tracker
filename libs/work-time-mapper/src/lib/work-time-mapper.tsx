import styles from './work-time-mapper.module.scss';

/* eslint-disable-next-line */
export interface WorkTimeMapperProps {}

export function WorkTimeMapper(props: WorkTimeMapperProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to WorkTimeMapper!</h1>
    </div>
  );
}

export default WorkTimeMapper;
