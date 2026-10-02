const fs = require('fs');

// Additional Case 2 names that start with B, F, V to make the funnel thrilling:
const extra_c2 = [
  'Benning', 'Beverley', 'Blenheim', 'Bloxham', 'Bolitho', 'Boscawen', 'Boswell', 'Bottrell',
  'Boughton', 'Boulter', 'Bourchier', 'Bouverie', 'Bowdler', 'Bowes', 'Bowles', 'Boycott',
  'Brabazon', 'Bracebridge', 'Bradburne', 'Bradlaugh', 'Bradshaw', 'Bramhall', 'Bramston',
  'Branston', 'Brassington', 'Braund', 'Braybrooke', 'Breckenridge', 'Brecknock', 'Bremridge',
  'Brenton', 'Bretherton', 'Brewster', 'Bridgeman', 'Bridges', 'Bridport', 'Brightman',
  'Brindley', 'Brisbane', 'Broadbent', 'Broadhurst', 'Broadley', 'Broadmead', 'Brockhurst',
  'Brocklebank', 'Brocklehurst', 'Brodrick', 'Bromehead', 'Bromhead', 'Bromley', 'Brooke',
  'Broomfield', 'Broomhead', 'Broughton', 'Brouncker', 'Brownrigg', 'Brucefield', 'Brunel',
  'Brunskill', 'Brydges', 'Buckhurst', 'Buckingham', 'Buckland', 'Buckle', 'Buckmaster',
  'Bucknill', 'Bulkeley', 'Buller', 'Bullivant', 'Bulmer', 'Bulstrode', 'Bulwer', 'Bunbury',
  'Burcham', 'Burdett', 'Burdon', 'Burford', 'Burges', 'Burgess', 'Burgon', 'Burgoyne',
  'Burkill', 'Burleigh', 'Burmester', 'Burnaby', 'Burne', 'Burnell', 'Burnet', 'Burnett',
  'Burney', 'Burnham', 'Burnside', 'Burrell', 'Burridge', 'Burroughes', 'Burrows', 'Burt',
  'Bury', 'Busfeild', 'Bushby', 'Bushell', 'Busk', 'Buston', 'Butcher', 'Butler',
  'Butlin', 'Butterfield', 'Butterton', 'Butterworth', 'Buttle', 'Buxton', 'Byam', 'Byass',
  'Byfield', 'Byng', 'Bythesea',
  'Fitzgibbon', 'Fitzherbert', 'Fitzhugh', 'Fitzjames', 'Fitzmaurice', 'Fitzsimmons', 'Fitzwarine',
  'Fitzwilliam', 'Flemington', 'Fontenoy', 'Forrester', 'Fothergill', 'Foxcroft', 'Frankland',
  'Freeling', 'Fulbright', 'Fullerton', 'Frobisher', 'Frothingham', 'Fairbrother', 'Fairclough',
  'Fairweather', 'Farquhar', 'Farrington', 'Featherstone', 'Fetherstonhaugh', 'Fortescue', 'Foxglove',
  'Valerius', 'Vandeleur', 'Vane', 'Vanneck', 'Vansittart', 'Venables', 'Venning', 'Vereker',
  'Verling', 'Vernham', 'Verulam', 'Vesey', 'Vickers', 'Victor', 'Villers', 'Vining', 'Voce',
  'Vosper', 'Voules', 'Vowles', 'Vulliamy', 'Vyner', 'Vyrnwy'
];

