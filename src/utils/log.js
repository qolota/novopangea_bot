import moment from 'moment';

export default function log({project, message, info}) {
  console.log(
    `[${moment(new Date()).format('HH:mm:ss DD/MM/YYYY')}][${project}] ${message || '--'}`,
    info || {}
  );
};
