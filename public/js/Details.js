angular.module('Pcard', ['ngMaterial'])
  .controller('AppCtrl', function($scope) {
    $scope.cards = [
      {
        title: 'DayBig Acres',
        developer: 'Prathik Developers, Bengaluru',
        discount: '10%',
        participation: 'RS. 250000',
        sqft: '1 Sq.ft',
        tenure: '24 month',
        totalPlots: '11',
        availablePlots: '5',
        bankApproved: '240',
        amountAchieved: 'RS. 2000000',
        sales: '1 Sq.ft',
        buyersProfile: '24 month'
      },
      {
        title: 'Dream Acres',
        developer: 'ShowTime Developer, Bengaluru',
        discount: '5%',
        participation: 'RS. 250000',
        sqft: '1 Sq.ft',
        tenure: '24 month',
        totalPlots: '11',
        availablePlots: '5',
        bankApproved: '240',
        amountAchieved: 'RS. 2000000',
        sales: '1 Sq.ft',
        buyersProfile: '24 month'
      },
      // Add more cards as needed
    ];
  });
