export class UserInfoModel {
  public username = '';
  public email = '';
  public password = '';
  public confirmPassword = '';
  public newPassword = '';
  public socials = [
    {
      type: 'facebook',
      url: ''
    },
    {
      type: 'github',
      url: ''
    },
    {
      type: 'linkedin',
      url: ''
    },
    {
      type: 'twitter',
      url: ''
    }
  ];
}
