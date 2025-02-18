const StatusLed = ({ status }) => {
  const colors = {
    unknown: 'bg-yellow-500',
    online: 'bg-green-500',
    offline: 'bg-red-500'
  };

  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} absolute top-4 right-4`} />
  );
};

export default StatusLed; 