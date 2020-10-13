CD C:\SkanerWV\Soap
call ng build --prod &&^
rmdir /S /Q \\10.255.15.148\d$\WebSkaner\Soap &&^
echo Folder has been removed &&^
Xcopy /E  C:\SkanerWV\Soap\dist\SOAP \\10.255.15.148\d$\WebSkaner\Soap\
