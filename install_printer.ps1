# Step 1 - Enable InternetPrinting feature
$Feature = Get-WindowsOptionalFeature -Online -FeatureName "Printing-Foundation-InternetPrinting-Client"
if ($Feature.State -ne "Enabled") {
        Enable-WindowsOptionalFeature -Online -FeatureName "Printing-Foundation-Features" -NoRestart
        Enable-WindowsOptionalFeature -Online -FeatureName "Printing-Foundation-InternetPrinting-Client" -NoRestart
}

# Step 2 - Install printer
$Result = Test-NetConnection 127.0.0.1 -Port 40023
If ($Result.TcpTestSucceeded) {
     Add-Printer -Name "Temp printer" -DriverName "Microsoft Print To PDF" -PortName "http://$($env:COMPUTERNAME):40024"
} Else {
      throw "Printer port doesn't exposed"
}